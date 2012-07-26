<%@language="javascript"%>
<%
  var timestamp = new Date().getTime();
  while (new Date() - timestamp < 5000) {
  }
  Response.Write(Request.QueryString('value') == 'ourjs' ? 'true' : 'false');
%>
