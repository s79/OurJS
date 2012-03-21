/**
 * @name crossDomain
 * @author sundongguo
 * @version 20080610
 *
 * 使用crossDomain()允许近似域名站点的数据交换。
 * 避免写成硬编码在本机调试时（无HTTP环境），出现错误信息。
 */
//--------------------------------------------------[crossDomain]
if(document.domain)document.domain=document.domain.substring(document.domain.indexOf(".")+1);
