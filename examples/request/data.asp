<%@language="javascript"%>
<%
  var timestamp = new Date().getTime();
  while (new Date() - timestamp < 500) {
  }
  Response.AddHeader('Content-Type', 'application/json');
  Response.AddHeader('Cache-Control', 'no-cache; must-revalidate');
  Response.Write('{"queryString": "' + (Request.ServerVariables('Query_String')) + '", "randomString": "' + timestamp.toString(36).slice(-4) + '"}');
%>
