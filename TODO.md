## To Do

## 2.3.1

- [ ] Implement [rate limit](https://developers.notion.com/reference/request-limits) handler

## 3.0.0

- [ ] Use Canvas API to `GET` assignments directly rather than parsing webpages
   - [ ] Authenticate with OAUTH2
   - [ ] Implement [pagination](https://canvas.instructure.com/doc/api/file.pagination.html) handler
   - [ ] Implemenet [throttling](https://canvas.instructure.com/doc/api/file.throttling.html) handler
   - [ ] [List user courses](https://canvas.instructure.com/doc/api/courses.html#method.courses.index)
      - [ ] Course selection functionality
   - [ ] [List user assignments](https://canvas.instructure.com/doc/api/assignments.html#method.assignments_api.index) for each (configured) course

- [ ] Create public Notion integration, rather than requiring users to create their own Internal integration?
