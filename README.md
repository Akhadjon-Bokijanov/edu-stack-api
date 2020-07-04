# edu-stack-api
EduStackAPI server


API docs:
  **Attention: Error messages and bad requests should be taken into account!
   ------------------------------------------------------- Sign in/up ---------------------------------------------------------
  .../ES/api/register -> {
    request type: POST,
    body params: {
      firstName, lastName (optional), email, password
    },
    header params: NONE,
    returning response: {
      body: user object,
      header: x-token
    }
  
  .../ES/api/login -> {
    request type: POST,
    body params: {
      email, password
    },
    header params: NONE,
    returning response: {
      body: user object,
      header: x-token
    }
    
    ----------------------------------------------------- News related API endpoints ---------------------------------------------
    .../ES/api/news -> {
    request type: GET,
    body params: NONE
    header params: NONE,
    returning response: {
      body: array of news objects,
      header: NONE
    }
    
    .../ES/api/news/:newsID -> {
    request type: GET,
    body params: NONE
    header params: NONE,
    returning response: {
      body: single news object,
      header: NONE
    }
     
    .../ES/api/news -> {
    request type: POST,
    body params: {
        title, description, organization, category, imageUrl, isImportant, detail
    }
    header params: x-token,
    returning response: {
      body: created news object,
      header: NONE
    }
    
    .../ES/api/news/:newsID -> {
    request type: DELETE,
    body params: NONE
    header params: x-token,
    returning response: {
      body: deleted news object,
      header: NONE
    }
    
    .../ES/api/news/:newsID -> {
    request type: PATCH,
    body params: {
        title, description, organization, category, imageUrl, isImportant, detail
    }
    header params: x-header,
    returning response: {
      body: updated news object,
      header: NONE
    }
    
    
    .../ES/api/news/approve/:newsID -> {
    request type: POST,
    body params: NONE
    header params: x-token,
    returning response: {
      body: approved news object,
      header: NONE
    }
    
    ---------------------------------------------------------- Test related API endpoints -------------------------------------------------
    COMING SOON!!!
