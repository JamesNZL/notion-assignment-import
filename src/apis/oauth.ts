import browser from 'webextension-polyfill';

import { Storage } from './storage';

import { AuthorisedResponse } from '../types/notion';

export const OAuth2 = <const>{
	ENDPOINTS: {
		authorise: 'https://oauth.jamesnzl.xyz/api/notion/authorise',
		accessToken: 'https://oauth.jamesnzl.xyz/api/notion/access-token',
	},

	isIdentitySupported: Boolean(browser.identity),

	async getAuthorisationURL() {
		if (!this.isIdentitySupported) throw new Error('Unable to access the browser\'s identity API.');

		return this.ENDPOINTS.authorise + '?' + new URLSearchParams({
			redirect_uri: browser.identity.getRedirectURL('oauth'),
			state: await this.getState(),
		});
	},

	async getState() {
		const validCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let characterArray = new Uint8Array(40);

		crypto.getRandomValues(characterArray);
		characterArray = characterArray.map(x => validCharacters.charCodeAt(x % validCharacters.length));

		const randomState = String.fromCharCode(...characterArray);
		await Storage.setOAuthState(randomState);

		return randomState;
	},

	async verifyState(state: string) {
		return state === await Storage.getOAuthState();
	},

	async authorise() {
		if (!this.isIdentitySupported) throw new Error('Unable to access the browser\'s identity API.');

		try {
			const authorisation = await browser.identity.launchWebAuthFlow({
				url: await this.getAuthorisationURL(),
				interactive: true,
			});

			const grant = new URL(authorisation);

			const state = grant.searchParams.get('state');

			if (!state || state === 'undefined' || !this.verifyState(state)) throw new Error(`Received state ${state} does not match generated state ${await Storage.getOAuthState()}.`);

			const code = grant.searchParams.get('code');

			if (!code || code === 'undefined') throw new Error('No authorisation code received.');

			const authorisedResponse: AuthorisedResponse = await fetch(this.ENDPOINTS.accessToken, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					code,
				}),
			}).then(response => response.json());

			await Storage.setNotionFields({
				'notion.accessToken': authorisedResponse.access_token,
				'notion.botId': authorisedResponse.bot_id,
				'notion.workspace.id': authorisedResponse.workspace_id,
				'notion.workspace.name': authorisedResponse?.workspace_name ?? null,
				'notion.workspace.icon': authorisedResponse?.workspace_icon ?? null,
				'notion.owner.workspace': authorisedResponse.owner?.workspace ?? null,
				'notion.owner.type': authorisedResponse.owner?.type ?? null,
				'notion.owner.user.object': authorisedResponse.owner?.user?.object ?? null,
				'notion.owner.user.id': authorisedResponse.owner?.user?.id ?? null,
				'notion.owner.user.type': authorisedResponse.owner?.user?.type ?? null,
				'notion.owner.user.name': authorisedResponse.owner?.user?.name ?? null,
				'notion.owner.user.avatarURL': authorisedResponse.owner?.user?.avatar_url ?? null,
			});

			return true;
		}
		catch (error) {
			console.warn(error);
			alert('Authorisation failed. Please try again.');
			return false;
		}
	},
};