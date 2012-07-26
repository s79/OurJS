<%@language="javascript"%>
<%
  var timestamp = new Date().getTime();
  while (new Date() - timestamp < 2000) {
  }
  Response.Write(Request.QueryString('value') == 'ourjs' ? 'true' : 'false');
%>
