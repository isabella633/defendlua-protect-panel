import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scriptId = url.pathname.split("/").pop();
    const hwid = url.searchParams.get("key") || url.searchParams.get("hwid");

    if (!scriptId) {
      return new Response('print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script ID not provided")', {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

 
    if (!hwid) {
      console.log("Stage 1 - Serving HWID collector:", { scriptId });
      const baseUrl = url.origin + url.pathname;
      const collectorScript = `
([[This file was protected with MoonSec V3]]):gsub('.+', (function(a) _VClXEICecdQt = a; end)); return(function(f,...)local t;local d;local o;local r;local b;local a;local e=24915;local n=0;local l={};while n<424 do n=n+1;while n<0x3aa and e%0x1c0a<0xe05 do n=n+1 e=(e*541)%19670 local h=n+e if(e%0x4c1c)<0x260e then e=(e+0x173)%0x7da8 while n<0x11b and e%0x363c<0x1b1e do n=n+1 e=(e+1003)%11562 local d=n+e if(e%0x14d6)<0xa6b then e=(e-0x16f)%0xb0ac local e=45513 if not l[e]then l[e]=0x1 a={};end elseif e%2~=0 then e=(e+0x188)%0xa030 local e=55654 if not l[e]then l[e]=0x1 t=(not t)and _ENV or t;end else e=(e-0x2c5)%0xbf44 n=n+1 local e=84894 if not l[e]then l[e]=0x1 b=tonumber;end end end elseif e%2~=0 then e=(e*0x3e0)%0x687 while n<0x319 and e%0x3904<0x1c82 do n=n+1 e=(e-593)%25509 local h=n+e if(e%0x3da6)<=0x1ed3 then e=(e*0x21b)%0x1656 local e=7400 if not l[e]then l[e]=0x1 d=function(l)local e=0x01 local function n(n)e=e+n return l:sub(e-n,e-0x01)end while true do local l=n(0x01)if(l=="\5")then break end local e=r.byte(n(0x01))local e=n(e)if l=="\2"then e=a.YJrZqTRC(e)elseif l=="\3"then e=e~="\0"elseif l=="\6"then t[e]=function(e,n)return f(8,nil,f,n,e)end elseif l=="\4"then e=t[e]elseif l=="\0"then e=t[e][n(r.byte(n(0x01)))];end local n=n(0x08)a[n]=e end end end elseif e%2~=0 then e=(e+0x300)%0x7107 local e=8328 if not l[e]then l[e]=0x1 o="\4\8\116\111\110\117\109\98\101\114\89\74\114\90\113\84\82\67\0\6\115\116\114\105\110\103\4\99\104\97\114\98\90\105\98\110\76\87\111\0\6\115\116\114\105\110\103\3\115\117\98\83\99\121\65\103\107\112\99\0\6\115\116\114\105\110\103\4\98\121\116\101\73\111\79\69\107\110\85\122\0\5\116\97\98\108\101\6\99\111\110\99\97\116\75\110\103\117\110\117\81\115\0\5\116\97\98\108\101\6\105\110\115\101\114\116\117\75\66\99\84\118\67\88\5";end else e=(e*0x1d9)%0x5d64 n=n+1 local e=19305 if not l[e]then l[e]=0x1 end end end else e=(e*0x2fc)%0xa65b n=n+1 while n<0x76 and e%0x36bc<0x1b5e do n=n+1 e=(e*1010)%49898 local d=n+e if(e%0x3b82)>=0x1dc1 then e=(e*0xa3)%0x8818 local e=41301 if not l[e]then l[e]=0x1 t=getfenv and getfenv();end elseif e%2~=0 then e=(e-0x232)%0x7b1b local e=71610 if not l[e]then l[e]=0x1 end else e=(e+0x201)%0x804f n=n+1 local e=6786 if not l[e]then l[e]=0x1 r=string;end end end end end e=(e*912)%4886 end d(o);local e={};for n=0x0,0xff do local l=a.bZibnLWo(n);e[n]=l;e[l]=n;end local function h(n)return e[n];end local r=(function(o,d)local r,l=0x01,0x10 local n={{},{},{}}local t=-0x01 local e=0x01 local f=o while true do n[0x03][a.ScyAgkpc(d,e,(function()e=r+e return e-0x01 end)())]=(function()t=t+0x01 return t end)()if t==(0x0f)then t=""l=0x000 break end end local t=#d while e<t+0x01 do n[0x02][l]=a.ScyAgkpc(d,e,(function()e=r+e return e-0x01 end)())l=l+0x01 if l%0x02==0x00 then l=0x00 a.uKBcTvCX(n[0x01],(h((((n[0x03][n[0x02][0x00]]or 0x00)*0x10)+(n[0x03][n[0x02][0x01]]or 0x00)+f)%0x100)));f=o+f;end end return a.KngunuQs(n[0x01])end);d(r(39,"Q9?Lyv7K#JS:a!{Y!{"));d(r(149,"89^+Im}xnJz3,CfM}3C,3I^?nJf3m33M,xJ^_fx9CMIfzxM^n^C^+n,C9n+}z^xnC}+M3m^cn^M+I^,f^+zCfnm3xnfx3C^zn,M,}C,39,nIM9m^C{m,,+3,^C0mx9Cz+,z,9:9Jf,I3,J^+J+f,x^3C9n3}M9}7MzffmC+9Jpuf}CxmIxzz9}JIMxmJC}I9z,9}mmfn^}If,9J+M/}z,f+9z3b+n9CJIm3z9fnMCMm,3n9}3h^SxnnHfM,}^,J3.xx)C^I^z}A^x3,J+x,I9-}MSI:^x^I,zI9LnmfJMm,M++zWM,}JC,I^3J9x}%f9mf3m99+nzmxMf+m7z,9Jn,ff}yz}0M359mm^,}fnmI^zJxMJ}JCz^I39fJn,fC+J,n1}^CJzx^,MI9zmXfnzC++x,^99xnCJ}IfICJIn9,x3MJmn}/^,JCU3x}fI^C,9^(J^A^+,3a+}+z"));local e=(-10519+(function()local d,l=0,1;(function(e,l,n)e(e(l,l and e,e),n(l,n and n,e),n(e,n,n))end)(function(t,n,e)if d>162 then return n end d=d+1 l=(l*377)%37924 if(l%1720)>=860 then return e(t(e,e,e and n),n(e,t,n and e),t(t,e,e))else return n end return n end,function(e,t,n)if d>179 then return t end d=d+1 l=(l*117)%324 if(l%446)>=223 then return t else return t(t(n,n and n,e),e(e and e,t,n)and e(e,e,e),n(e,e,n))end return n(t(e,e,n),t(t,e,t),n(n,t,n))end,function(n,e,t)if d>107 then return e end d=d+1 l=(l-610)%39915 if(l%1702)<=851 then return t(e(n,e,n),t(e,n,n),n(e,e,t and e))else return e end return e end)return l;end)())local de=(getfenv)or(function()return _ENV end);local c=a.biDBxrDM or a.freCYkWH;local o=4;local d=3;local z=1;local t=2;local function j(_,...)local u=r(e,"R1Eb+yvB*>M :_x9bEyM*B +xb1_b v*>yxvvMBxMMx>5*Eyv9>v_+:b1:+b*+ByvB>9 9x:1>My:>xbb>yEv:>_:+1bbxv:*v_v>1xbx>1v+b:+/ybbvM++ BxB1Bb_EyM>:-99_>yv*yM9x199EMv**v E> 19bxBv>BB:_vEyyEBx>p:99Mx++By1+_B_My_E99>: :xB19+:h9ybvB>+:1b *M Bxb9yb+y9**M>9BEE+vB*>x_B_>EB+9B:MMxjx%+3v_>*v+*;M__MkBvyv1*x  x>1y+Ev9Mx_:9vEbyV*EMM_BQ++bv>*  *xy1+b9v:>>x:D>E4+_BMM__+fEExyx** >9MI9b:v>>::b911_+M>yM+_19xE:y**y Ex11Mb>vv>b:jx_1M+BB+M :x9:E*yy*EM9_:?>b*vb>1 _x 1B+vB1 h_E9*EByE*-M:_>Fvbbvb*_ _xB1y+1vx> :*t1EEy1B:M _vqvbqv9>B BxB11+Ev >*:y9*Ex+:B_Mv_+gXExyM** +x11bb v*>y:+x91:+>Bv:E_#YeEMy>*+ y_x6 bxvy>E 9x_1>+vBbME:_9MEByx*1Mx_ uMb>vE*9 :ykBB I_y>9_E9BE+y19E1M+ B>M+:*9MEtx*1*+.v_>M11vb*b>B_9M _y!EE9y:*> vsby%b9v_>B:+91>1:;_MMBx199E:y>x_1*y+BE E::9BbvvE*M Mxb)bb:v1E y_*b C__B1>:_*9>byy+B:+*BE>9::9>EvybBJx:_:l*b+v1*x1MxM1_+Ev9>:bxv+*x xx:E1+yvbyByx*  *9BbMb9v:>>:_9bEU+_*e:E_+l1Exy9** vxE1=b:v_Mx:b9L1_+xBBMy_1LE+by**y ExB!:bMvvMyx*x_1M+BB M1:x9 E*B9*EM9_:6Mbvvb>3 _wb1B++B1>x: 9*Eyyv>BM:_>Pvy*vu*x M9>b:+1vx> :x9yEE+9*E:+_v-bbXv>*M *x+1Ebxv9 ?:y9E19y*B>MB_b{++yyM*B +9 Hxb:v*MBxMx91:+>B:Mb_d9_EM*E*+ 1_xf:b*vB>E_1x91>+BBbM>:_9MEBvv>vMx__=*bBvE*9 :9 E++bBb>_: 9BE+y1>xM:_*}*bEvE*: :xv1b+Ev_>::B9vE1y6B :*xvTEb1y:*  vx*1#+9B >B:*91Ev+ B*Myx+bbE:yx*v BxW7_bMvBMP:19e1 +_ByM+:99:Exyv*b Y__?Mb>v+>1:bx 1*+yB+>9::9>EMyM*QM__ME:b+vE*x:_9>1y+Ev9Mv:>9vEbvE>+MM_*r+bbyx*  *9BExb9vx>>:B9bE4+_>M:+_+{bExy_** *xEG9+>v>>B:b9E1_+:BB:+x>9xE:y**v Ex+,:+ BM>b:bx_EE+BB+M1x51+E*y>*E b_:/>bvvbMv _x 1B+*B1Mz: 9*y1yEB9M:_>{vb+va*_x0xB1++1Br> :*9yEEv_B:M>_vw+b.y_*M Bx+11bxv >M:y9E19+x*;Mv_b55By:x9 E+E*BbM9vM>>:Ex91: J_B1=byzbEMyB*+:bIcX b*vy>+ 9x:1>vv*xMs:_9MEBy+*EMx_ 1bbyv+*9 :x>1v+bBm 1:M9BE+ybBxM _*Zybby9*: >xv1b+fv_>M:x9+E1+xB:M*_ynEE9y:*> vxb1W");local n=0;a.ciMnXwGO(function()n=n+1 end)local function e(e,l)if l then return n end;n=e+n;end local l,n,h=f(0,f,e,u,a.IoOEknUz);local function r()local l,n=a.IoOEknUz(u,e(1,3),e(5,6)+2);e(2);return(n*256)+l;end;local s=true;local s=0 local function y()local e=n();local n=n();local d=1;local t=(l(n,1,20)*(2^32))+e;local e=l(n,21,31);local n=((-1)^l(n,32));if(e==0)then if(t==s)then return n*0;else e=1;d=0;end;elseif(e==2047)then return(t==0)and(n*(1/0))or(n*(0/0));end;return a.gyyyxLtG(n,e-1023)*(d+(t/(2^52)));end;local p=n;local function k(n)local l;if(not n)then n=p();if(n==0)then return'';end;end;l=a.ScyAgkpc(u,e(1,3),e(5,6)+n-1);e(n)local e=""for n=(1+s),#l do e=e..a.ScyAgkpc(l,n,n)end return e;end;local s=#a.XfILnOCm(b('\49.\48'))~=1 local e=n;local function j(...)return{...},a.RKkOKAav('#',...)end local function ne()local e={};local u={};local b={};local c={u,b,nil,e};local e=n()local f={}for t=1,e do local l=h();local e;if(l==1)then e=(h()~=#{});elseif(l==3)then local n=y();if s and a.VqQAtDHw(a.XfILnOCm(n),'.(\48+)$')then n=a.PymtyHQl(n);end e=n;elseif(l==2)then e=k();end;f[t]=e;end;for c=1,n()do local e=h();if(l(e,1,1)==0)then local a=l(e,2,3);local h=l(e,4,6);local e={r(),r(),nil,nil};if(a==0)then e[d]=r();e[o]=r();elseif(a==#{1})then e[d]=n();elseif(a==_[2])then e[d]=n()-(2^16)elseif(a==_[3])then e[d]=n()-(2^16)e[o]=r();end;if(l(h,1,1)==1)then e[t]=f[e[t]]end if(l(h,2,2)==1)then e[d]=f[e[d]]end if(l(h,3,3)==1)then e[o]=f[e[o]]end u[c]=e;end end;for e=1,n()do b[e-(#{1})]=ne();end;c[3]=h();return c;end;local function ee(l,n,e)local t=n;local t=e;return b(a.VqQAtDHw(a.VqQAtDHw(({a.ciMnXwGO(l)})[2],n),e))end local function s(m,u,h)local function te(...)local r,b,k,ee,ne,l,_,le,g,p,y,n;local e=0;while-1<e do if 3<=e then if 5<=e then if 1<e then repeat if e<6 then n=f(7);break;end;e=-2;until true;else e=-2;end else if 0<e then for n=27,93 do if e>3 then p=a.RKkOKAav('#',...)-1;y={};break;end;le={};g={...};break;end;else p=a.RKkOKAav('#',...)-1;y={};end end else if e>=1 then if-1<e then repeat if 2>e then k=f(6,6,3,97,m);ne=j ee=0;break;end;l=-41;_=-1;until true;else k=f(6,6,3,97,m);ne=j ee=0;end else r=f(6,30,1,7,m);b=f(6,10,2,17,m);end end e=e+1;end;for e=0,p do if(e>=k)then le[e-k]=g[e+1];else n[e]=g[e+1];end;end;local e=p-k+1 local e;local f;local function k(...)while true do end end while true do if l<-40 then l=l+42 end e=r[l];f=e[z];if 26<=f then if f>=39 then if 46<=f then if 49<=f then if 50>=f then if 48~=f then repeat if 50~=f then for f=0,3 do if 2<=f then if 3>f then n[e[t]]=h[e[d]];l=l+1;e=r[l];else if(n[e[t]]~=e[o])then l=l+1;else l=e[d];end;end else if-3~=f then repeat if f<1 then n[e[t]]=(e[d]~=0);l=l+1;e=r[l];break;end;h[e[d]]=n[e[t]];l=l+1;e=r[l];until true;else n[e[t]]=(e[d]~=0);l=l+1;e=r[l];end end end break;end;local t=e[t]local d={n[t](n[t+1])};local l=0;for e=t,e[o]do l=l+1;n[e]=d[l];end until true;else for f=0,3 do if 2<=f then if 3>f then n[e[t]]=h[e[d]];l=l+1;e=r[l];else if(n[e[t]]~=e[o])then l=l+1;else l=e[d];end;end else if-3~=f then repeat if f<1 then n[e[t]]=(e[d]~=0);l=l+1;e=r[l];break;end;h[e[d]]=n[e[t]];l=l+1;e=r[l];until true;else n[e[t]]=(e[d]~=0);l=l+1;e=r[l];end end end end else if 47<f then repeat if 52~=f then n[e[t]]=h[e[d]];break;end;local g,_,z,m,g,f,u,y,k,p,a,b,h,s;f=0;while f>-1 do if f<=2 then if 1>f then a=e;else if-2~=f then repeat if f>1 then z=d;break;end;_=t;until true;else _=t;end end else if 5>f then if 1<f then for e=14,63 do if 3<f then h=a[_];break;end;m=a[z];break;end;else h=a[_];end else if 4<f then for e=13,71 do if f~=5 then f=-2;break;end;n(h,m);break;end;else f=-2;end end end f=f+1 end l=l+1;e=r[l];u=e[t]n[u]=n[u](c(n,u+1,e[d]))l=l+1;e=r[l];f=0;while f>-1 do if 2>=f then if f<1 then y=t;k=d;p=o;else if 0<f then for n=37,60 do if 1~=f then b=a[k];break;end;a=e;break;end;else b=a[k];end end else if 4<f then if 4~=f then repeat if 5~=f then f=-2;break;end;n[h]=s;until true;else f=-2;end else if-1<=f then for e=33,72 do if f>3 then s=n[b];for e=1+b,a[p]do s=s..n[e];end;break;end;h=a[y];break;end;else h=a[y];end end end f=f+1 end l=l+1;e=r[l];do return n[e[t]]end l=l+1;e=r[l];l=e[d];until true;else n[e[t]]=h[e[d]];end end else if 47>f then local l=e[t]n[l]=n[l](c(n,l+1,e[d]))else if 47<f then local l=e[t];do return n[l](c(n,l+1,e[d]))end;else local e=e[t]n[e]=n[e]()end end end else if f>41 then if f<=43 then if f>41 then repeat if 43~=f then do return n[e[t]]();end;break;end;local f,c;for a=0,6 do if 3>a then if 0<a then if a>-1 then for f=36,88 do if 2>a then n(e[t],e[d]);l=l+1;e=r[l];break;end;n[e[t]]=h[e[d]];l=l+1;e=r[l];break;end;else n(e[t],e[d]);l=l+1;e=r[l];end else f=e[t]n[f]=n[f]()l=l+1;e=r[l];end else if 5<=a then if a~=6 then f=e[t]n[f]=n[f](n[f+1])l=l+1;e=r[l];else f=e[t];c=n[e[d]];n[f+1]=c;n[f]=c[e[o]];end else if a~=4 then n[e[t]]=h[e[d]];l=l+1;e=r[l];else n[e[t]]=n[e[d]][e[o]];l=l+1;e=r[l];end end end end until true;else do return n[e[t]]();end;end else if f>=43 then repeat if f<45 then local h,b,u,f,c,a,r;local l=0;while l>-1 do if l>=3 then if 4>=l then if l>1 then repeat if 4>l then a=f[h];break;end;r=n[c];for e=1+c,f[u]do r=r..n[e];end;until true;else a=f[h];end else if l~=1 then repeat if l~=6 then n[a]=r;break;end;l=-2;until true;else l=-2;end end else if l<1 then h=t;b=d;u=o;else if 1~=l then c=f[b];else f=e;end end end l=l+1 end break;end;if(n[e[t]]~=e[o])then l=l+1;else l=e[d];end;until true;else local h,u,b,f,c,a,r;local l=0;while l>-1 do if l>=3 then if 4>=l then if l>1 then repeat if 4>l then a=f[h];break;end;r=n[c];for e=1+c,f[b]do r=r..n[e];end;until true;else a=f[h];end else if l~=1 then repeat if l~=6 then n[a]=r;break;end;l=-2;until true;else l=-2;end end else if l<1 then h=t;u=d;b=o;else if 1~=l then c=f[u];else f=e;end end end l=l+1 end end end else if f>39 then if f~=39 then repeat if 41>f then n[e[t]]=h[e[d]];break;end;do return n[e[t]]();end;until true;else n[e[t]]=h[e[d]];end else local t=e[t];local l=n[e[d]];n[t+1]=l;n[t]=l[e[o]];end end end else if 31<f then if f>=35 then if 36<f then if f==37 then local b=b[e[d]];local c;local f={};c=a.kPbSFuzg({},{__index=function(n,e)local e=f[e];return e[1][e[2]];end,__newindex=function(l,e,n)local e=f[e]e[1][e[2]]=n;end;});for t=1,e[o]do l=l+1;local e=r[l];if e[z]==5 then f[t-1]={n,e[d]};else f[t-1]={u,e[d]};end;y[#y+1]=f;end;n[e[t]]=s(b,c,h);else do return n[e[t]]end end else if f>=34 then for l=19,79 do if 35~=f then local e=e[t]n[e]=n[e](n[e+1])break;end;local l=e[t];do return n[l](c(n,l+1,e[d]))end;break;end;else local l=e[t];do return n[l](c(n,l+1,e[d]))end;end end else if 33<=f then if 29~=f then repeat if f>33 then local f,a;n[e[t]]=h[e[d]];l=l+1;e=r[l];f=e[t];a=n[e[d]];n[f+1]=a;n[f]=a[e[o]];l=l+1;e=r[l];n[e[t]]=u[e[d]];l=l+1;e=r[l];f=e[t];do return n[f](c(n,f+1,e[d]))end;l=l+1;e=r[l];f=e[t];do return c(n,f,_)end;l=l+1;e=r[l];do return end;break;end;local r,h,f,o,a,c;local l=0;while l>-1 do if 3<l then if l>=6 then if l<7 then n[c]=a;else l=-2;end else if 0~=l then repeat if 4<l then c=r[h];break;end;a=o[r[f]];until true;else a=o[r[f]];end end else if 1>=l then if l~=-4 then repeat if l~=0 then h=t;break;end;r=e;until true;else h=t;end else if 0~=l then repeat if l<3 then f=d;break;end;o=n;until true;else f=d;end end end l=l+1 end until true;else local f,a;n[e[t]]=h[e[d]];l=l+1;e=r[l];f=e[t];a=n[e[d]];n[f+1]=a;n[f]=a[e[o]];l=l+1;e=r[l];n[e[t]]=u[e[d]];l=l+1;e=r[l];f=e[t];do return n[f](c(n,f+1,e[d]))end;l=l+1;e=r[l];f=e[t];do return c(n,f,_)end;l=l+1;e=r[l];do return end;end else n[e[t]]=s(b[e[d]],nil,h);end end else if 28>=f then if f<=26 then local e=e[t]n[e]=n[e](n[e+1])else if 26<=f then repeat if 28>f then if not n[e[t]]then l=l+1;else l=e[d];end;break;end;h[e[d]]=n[e[t]];until true;else h[e[d]]=n[e[t]];end end else if f>=30 then if f>=27 then repeat if 30<f then local f,a,d;f=e[t]a={n[f](n[f+1])};d=0;for e=f,e[o]do d=d+1;n[e]=a[d];end l=l+1;e=r[l];do return end;break;end;do return end;until true;else do return end;end else local b,h,c,r,a,u,f;local l=0;while l>-1 do if l<3 then if 1>l then b=t;h=d;c=o;else if l~=-3 then repeat if l~=1 then a=r[h];break;end;r=e;until true;else a=r[h];end end else if 5>l then if 2<l then for e=21,75 do if 4~=l then u=r[b];break;end;f=n[a];for e=1+a,r[c]do f=f..n[e];end;break;end;else f=n[a];for e=1+a,r[c]do f=f..n[e];end;end else if l>=1 then for e=10,88 do if l>5 then l=-2;break;end;n[u]=f;break;end;else n[u]=f;end end end l=l+1 end end end end end else if 13<=f then if f<19 then if 15<f then if 16<f then if 14~=f then repeat if 17~=f then n[e[t]]=u[e[d]];break;end;n(e[t],e[d]);until true;else n(e[t],e[d]);end else n[e[t]]=(e[d]~=0);end else if f>=14 then if f>=11 then repeat if f>14 then local b=b[e[d]];local c;local f={};c=a.kPbSFuzg({},{__index=function(n,e)local e=f[e];return e[1][e[2]];end,__newindex=function(l,e,n)local e=f[e]e[1][e[2]]=n;end;});for t=1,e[o]do l=l+1;local e=r[l];if e[z]==5 then f[t-1]={n,e[d]};else f[t-1]={u,e[d]};end;y[#y+1]=f;end;n[e[t]]=s(b,c,h);break;end;n[e[t]]=s(b[e[d]],nil,h);until true;else n[e[t]]=s(b[e[d]],nil,h);end else n(e[t],e[d]);end end else if 22>f then if 19<f then if f~=21 then if not n[e[t]]then l=l+1;else l=e[d];end;else local e=e[t];do return c(n,e,_)end;end else l=e[d];end else if f<=23 then if f~=20 then repeat if f~=23 then local l=e[t]n[l]=n[l](c(n,l+1,e[d]))break;end;local f,c;for a=0,6 do if a>2 then if 4<a then if a~=6 then n(e[t],e[d]);l=l+1;e=r[l];else n(e[t],e[d]);end else if a>-1 then for h=12,79 do if 4~=a then f=e[t]n[f]=n[f](n[f+1])l=l+1;e=r[l];break;end;f=e[t];c=n[e[d]];n[f+1]=c;n[f]=c[e[o]];l=l+1;e=r[l];break;end;else f=e[t]n[f]=n[f](n[f+1])l=l+1;e=r[l];end end else if 1>a then n[e[t]]=h[e[d]];l=l+1;e=r[l];else if 0<a then repeat if 2>a then n[e[t]]=h[e[d]];l=l+1;e=r[l];break;end;n[e[t]]=n[e[d]][e[o]];l=l+1;e=r[l];until true;else n[e[t]]=n[e[d]][e[o]];l=l+1;e=r[l];end end end end until true;else local f,c;for a=0,6 do if a>2 then if 4<a then if a~=6 then n(e[t],e[d]);l=l+1;e=r[l];else n(e[t],e[d]);end else if a>-1 then for h=12,79 do if 4~=a then f=e[t]n[f]=n[f](n[f+1])l=l+1;e=r[l];break;end;f=e[t];c=n[e[d]];n[f+1]=c;n[f]=c[e[o]];l=l+1;e=r[l];break;end;else f=e[t]n[f]=n[f](n[f+1])l=l+1;e=r[l];end end else if 1>a then n[e[t]]=h[e[d]];l=l+1;e=r[l];else if 0<a then repeat if 2>a then n[e[t]]=h[e[d]];l=l+1;e=r[l];break;end;n[e[t]]=n[e[d]][e[o]];l=l+1;e=r[l];until true;else n[e[t]]=n[e[d]][e[o]];l=l+1;e=r[l];end end end end end else if 23~=f then repeat if 25~=f then l=e[d];break;end;local e=e[t];do return c(n,e,_)end;until true;else local e=e[t];do return c(n,e,_)end;end end end end else if 6<=f then if 8<f then if 10<f then if 11~=f then h[e[d]]=n[e[t]];else local e=e[t]n[e]=n[e]()end else if f>6 then for a=28,87 do if f<10 then n[e[t]]=(e[d]~=0);break;end;local c,u,a;for f=0,5 do if f<=2 then if f>=1 then if 1==f then c=e[t]n[c]=n[c]()l=l+1;e=r[l];else n(e[t],e[d]);l=l+1;e=r[l];end else n[e[t]]=n[e[d]];l=l+1;e=r[l];end else if 3<f then if 0<f then repeat if 4<f then n[e[t]]=h[e[d]];break;end;u=e[d];a=n[u]for e=u+1,e[o]do a=a..n[e];end;n[e[t]]=a;l=l+1;e=r[l];until true;else n[e[t]]=h[e[d]];end else n[e[t]]=n[e[d]];l=l+1;e=r[l];end end end break;end;else n[e[t]]=(e[d]~=0);end end else if f<=6 then local t=e[t]local d={n[t](n[t+1])};local l=0;for e=t,e[o]do l=l+1;n[e]=d[l];end else if 3<f then repeat if 8>f then local l=e[t];local t=n[e[d]];n[l+1]=t;n[l]=t[e[o]];break;end;if(n[e[t]]~=e[o])then l=l+1;else l=e[d];end;until true;else if(n[e[t]]~=e[o])then l=l+1;else l=e[d];end;end end end else if f>=3 then if f<=3 then n[e[t]]=n[e[d]][e[o]];else if f>=0 then repeat if 4<f then n[e[t]]=n[e[d]];break;end;do return end;until true;else n[e[t]]=n[e[d]];end end else if 1>f then n[e[t]]=n[e[d]][e[o]];else if f>=-1 then for l=40,84 do if f>1 then do return n[e[t]]end break;end;n[e[t]]=u[e[d]];break;end;else n[e[t]]=u[e[d]];end end end end end end l=1+l;end;end;return te end;local t=0xff;local a={};local r=(1);local d='';(function(n)local l=n local f=0x00 local e=0x00 l={(function(r)if f>0x28 then return r end f=f+1 e=(e+0xb27-r)%0x1e return(e%0x03==0x1 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xe0);end return true end)'Yomel'and l[0x1](0x3b2+r))or(e%0x03==0x0 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xd2);end return true end)'PnC_t'and l[0x3](r+0xd0))or(e%0x03==0x2 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xde);d='\37';t={function()t()end};d=d..'\100\43';end return true end)'dhApn'and l[0x2](r+0x103))or r end),(function(o)if f>0x28 then return o end f=f+1 e=(e+0x745-o)%0x47 return(e%0x03==0x2 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xa8);end return true end)'YCGPI'and l[0x2](0x3a3+o))or(e%0x03==0x0 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x4e);end return true end)'DwVPu'and l[0x1](o+0x303))or(e%0x03==0x1 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xd);d={d..'\58 a',d};a[r]=ne();r=r+(1);d[1]='\58'..d[1];t[2]=0xff;end return true end)'VhAhP'and l[0x3](o+0x307))or o end),(function(o)if f>0x27 then return o end f=f+1 e=(e+0xf25-o)%0x21 return(e%0x03==0x2 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xca);end return true end)'aJAEe'and l[0x1](0x1ec+o))or(e%0x03==0x0 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x32);a[r]=de();r=r+t;end return true end)'lMSuR'and l[0x3](o+0x3a8))or(e%0x03==0x1 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x1b);t[2]=(t[2]*(ee(function()a()end,c(d))-ee(t[1],c(d))))+1;a[r]={};t=t[2];r=r+t;end return true end)'sWOJ_'and l[0x2](o+0x34a))or o end)}l[0x1](0x15b1)end){};local e=s(c(a));return e(...);end return j((function()local n={}local e=0x01;local l;if a.tbBgLGqQ then l=a.tbBgLGqQ(j)else l=''end if a.VqQAtDHw(l,a.gMJLBUvr)then e=e+0;else e=e+1;end n[e]=0x02;n[n[e]+0x01]=0x03;return n;end)(),...)end)((function(e,n,l,d,t,f)local f;if 3<e then if e>=6 then if e>=7 then if 5<e then repeat if e~=7 then do return l(e,nil,l);end break;end;do return setmetatable({},{['__\99\97\108\108']=function(e,l,t,d,n)if n then return e[n]elseif d then return e else e[l]=t end end})end until true;else do return setmetatable({},{['__\99\97\108\108']=function(e,t,l,d,n)if n then return e[n]elseif d then return e else e[t]=l end end})end end else do return t[l]end;end else if e>=2 then for f=44,56 do if e~=4 then local e=d;do return function()local n=n(l,e(e,e),e(e,e));e(1);return n;end;end;break;end;local e=d;local f,o,r=t(2);do return function()local t,d,l,n=n(l,e(e,e),e(e,e)+3);e(4);return(n*f)+(l*o)+(d*r)+t;end;end;break;end;else local e=d;local f,d,t=t(2);do return function()local n,r,l,o=n(l,e(e,e),e(e,e)+3);e(4);return(o*f)+(l*d)+(r*t)+n;end;end;end end else if e>=2 then if e>-2 then for f=39,69 do if 2<e then do return n(1),n(4,t,d,l,n),n(5,t,d,l)end;break;end;do return 16777216,65536,256 end;break;end;else do return 16777216,65536,256 end;end else if e==0 then do return n(1),n(4,t,d,l,n),n(5,t,d,l)end;else do return function(l,e,n)if n then local e=(l/2^(e-1))%2^((n-1)-(e-1)+1);return e-e%1;else local e=2^(e-1);return(l%(e+e)>=e)and 1 or 0;end;end;end;end end end end),...)

if success then
    local loadSuccess, loadError = pcall(function()
        loadstring(result)()
    end)
    if not loadSuccess then
        print("⛔ Script Execution Error ⛔")
        print(tostring(loadError))
    end
else
    print("⛔ ACCESS DENIED ⛔")
    print("Failed to load protected script")
    print("Your HWID: " .. hwid)
end`;
      
      return new Response(collectorScript, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    console.log("Stage 2 - Validating access:", { scriptId, hwid: "provided" });

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get client IP address from request headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

    console.log("Request details:", { scriptId, hwid: hwid ? "provided" : "missing", clientIp });

    // Fetch script data
    const { data: script, error } = await supabaseAdmin
      .from("scripts")
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id")
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      console.error("Script not found:", error);
      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script not found or does not exist")\nprint("This access attempt has been logged")',
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Fetch owner's subscription plan
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", script.owner_id)
      .single();

    const userPlan = subscription?.plan || "free";
    const hwidList = script.hwid_list || [];
    const ipList = script.ip_list || [];
    const hwidBlacklist = script.hwid_blacklist || [];
    const publicAccess = script.public_access || false;

    // Helper function to log access attempts
    const logAccess = async (status: string, reason?: string) => {
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid,
        ip_address: clientIp,
        status,
        reason,
      });
    };

    // Check blacklist first (applies to all plans)
    if (hwidBlacklist.includes(hwid)) {
      console.log("Access denied - blacklisted:", { scriptId, hwid, clientIp });
      await logAccess("denied", "HWID blacklisted");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID has been blacklisted")\nprint("Your HWID: ${hwid}")\nprint("Contact the script owner if you believe this is an error")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Check IP whitelist (applies to all plans)
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    if (!isIpWhitelisted) {
      console.log("Access denied - IP not authorized:", { scriptId, hwid, clientIp });
      await logAccess("denied", "IP address not authorized");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: IP address not authorized")\nprint("Your HWID: ${hwid}")\nprint("Contact the script owner to request IP whitelist authorization")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Check if HWID is already whitelisted
    const isHwidWhitelisted = hwidList.includes(hwid);

    // For Pro/Enterprise with public access enabled, auto-whitelist new HWIDs
    const isProOrEnterprise = userPlan === "pro" || userPlan === "enterprise";
    if (isProOrEnterprise && publicAccess && !isHwidWhitelisted) {
      console.log("Auto-whitelisting new HWID:", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });

      // Add HWID to whitelist
      const updatedHwidList = [...hwidList, hwid];
      await supabaseAdmin.from("scripts").update({ hwid_list: updatedHwidList }).eq("id", scriptId);

      await logAccess("allowed", "Auto-whitelisted (Public Access)");
    } else if (isProOrEnterprise && publicAccess) {
      console.log("Public access granted (already whitelisted):", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });
      await logAccess("allowed", "Public access (already whitelisted)");
    } else if (!isHwidWhitelisted) {
      // For Free plan OR Pro/Enterprise with public access disabled, deny if not whitelisted
      console.log("Access denied - HWID not authorized:", { scriptId, hwid, clientIp, plan: userPlan });
      await logAccess("denied", "HWID not authorized");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID not authorized")\nprint("Your HWID: ${hwid}")\nprint("Contact the script owner to request HWID authorization")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    } else {
      console.log("Script execution authorized:", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });
      await logAccess("allowed", "HWID whitelisted");
    }

    // Return raw script for Roblox execution only
    return new Response(script.script_key, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "X-Protected-By": "DefendLua",
      },
    });
  } catch (error) {
    console.error("Error serving raw script:", error);
    return new Response('print("Error: Internal server error")', {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
