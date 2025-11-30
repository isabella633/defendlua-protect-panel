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
([[This file was protected with MoonSec V3]]):gsub('.+', (function(a) _WuTIBPiytQDm = a; end)); return(function(r,...)local t;local a;local o;local s;local f;local d;local e=24915;local n=0;local l={};while n<224 do n=n+1;while n<0x2b9 and e%0x41aa<0x20d5 do n=n+1 e=(e+25)%7298 local h=n+e if(e%0x11e8)>=0x8f4 then e=(e+0x30)%0x46a6 while n<0x242 and e%0x3880<0x1c40 do n=n+1 e=(e-934)%12456 local t=n+e if(e%0x4d5e)<0x26af then e=(e-0x144)%0x2467 local e=75772 if not l[e]then l[e]=0x1 a={};end elseif e%2~=0 then e=(e*0x14d)%0xa7d7 local e=30763 if not l[e]then l[e]=0x1 d=getfenv and getfenv();end else e=(e*0x1ed)%0x7aeb n=n+1 local e=10451 if not l[e]then l[e]=0x1 o=string;end end end elseif e%2~=0 then e=(e+0x3d4)%0x37b1 while n<0x375 and e%0x38f2<0x1c79 do n=n+1 e=(e*26)%1625 local t=n+e if(e%0x836)<=0x41b then e=(e-0x35c)%0x397d local e=26257 if not l[e]then l[e]=0x1 d=(not d)and _ENV or d;end elseif e%2~=0 then e=(e-0x376)%0x63b0 local e=23724 if not l[e]then l[e]=0x1 end else e=(e+0x2b5)%0x10f3 n=n+1 local e=59266 if not l[e]then l[e]=0x1 end end end else e=(e+0x195)%0x673 n=n+1 while n<0xcc and e%0x48f4<0x247a do n=n+1 e=(e+549)%42785 local h=n+e if(e%0x139e)<0x9cf then e=(e+0x12a)%0x9cb6 local e=86602 if not l[e]then l[e]=0x1 s=tonumber;end elseif e%2~=0 then e=(e*0x192)%0x7a9f local e=40679 if not l[e]then l[e]=0x1 f="\4\8\116\111\110\117\109\98\101\114\114\67\69\114\70\99\120\68\0\6\115\116\114\105\110\103\4\99\104\97\114\102\105\102\71\95\71\83\87\0\6\115\116\114\105\110\103\3\115\117\98\109\67\115\83\117\104\117\68\0\6\115\116\114\105\110\103\4\98\121\116\101\102\111\102\85\97\71\105\95\0\5\116\97\98\108\101\6\99\111\110\99\97\116\90\102\101\87\115\110\122\111\0\5\116\97\98\108\101\6\105\110\115\101\114\116\89\86\117\118\89\66\73\110\5";end else e=(e*0x3f)%0x427a n=n+1 local e=84200 if not l[e]then l[e]=0x1 t=function(t)local e=0x01 local function l(n)e=e+n return t:sub(e-n,e-0x01)end while true do local n=l(0x01)if(n=="\5")then break end local e=o.byte(l(0x01))local e=l(e)if n=="\2"then e=a.rCErFcxD(e)elseif n=="\3"then e=e~="\0"elseif n=="\6"then d[e]=function(n,e)return r(8,nil,r,e,n)end elseif n=="\4"then e=d[e]elseif n=="\0"then e=d[e][l(o.byte(l(0x01)))];end local n=l(0x08)a[n]=e end end end end end end end e=(e+841)%15930 end t(f);local e={};for n=0x0,0xff do local l=a.fifG_GSW(n);e[n]=l;e[l]=n;end local function h(n)return e[n];end local o=(function(f,t)local o,l=0x01,0x10 local n={{},{},{}}local d=-0x01 local e=0x01 local r=f while true do n[0x03][a.mCsSuhuD(t,e,(function()e=o+e return e-0x01 end)())]=(function()d=d+0x01 return d end)()if d==(0x0f)then d=""l=0x000 break end end local d=#t while e<d+0x01 do n[0x02][l]=a.mCsSuhuD(t,e,(function()e=o+e return e-0x01 end)())l=l+0x01 if l%0x02==0x00 then l=0x00 a.YVuvYBIn(n[0x01],(h((((n[0x03][n[0x02][0x00]]or 0x00)*0x10)+(n[0x03][n[0x02][0x01]]or 0x00)+r)%0x100)));r=f+r;end end return a.ZfeWsnzo(n[0x01])end);t(o(14,"uk6&dVW3 (z>bSKss3"));t(o(89,"7o34a.B1>MT-esF8T1.aB>ou-..488M8F4FTT3aoF-M-38e>1B3Ms-.F8>.FRBo>-3.1!M-v388F18.Is1M.31F33ae8Fo>T3>sa>oJFeaB>K3-1a8s8-:FeMMTs..8TM>aaFa3M4>s4>s34e813=--3BaFF-M.eFBaB8oUoMe.B8o4.a4F3>TaaF4>-o1Ts1B3iTs.TF8.B).o4TeB3J3To.1F-T.4MFoM343e.BTo1so114oTsB1-R.-BFoI--B4E>TB.383T3a-F4>Mo1-M>13FBToB3ee^B>oM-Mroo1-1B/8>To.98sM8.aFk1Ta1eT>8e>1o>131s;B>ooelasFBM3BMF1Te4>E.4>FI83M-4MF.M3oie9BM%4-M1>o3MMJoTT-F.1R.T.aTC3MT.4FFTa3Te1Mn3TBso>3>e41so>.eBaoo--B3Qe>3a-(4>34Fs.1.3o1F"));local e=(-3627+(function()local t,e=0,1;(function(l,n,e)n(e(e,e and l,n)and n(n and e,l and l,e),e(n,n,e),n(l,n,e))end)(function(d,l,n)if t>228 then return d end t=t+1 e=(e*197)%38893 if(e%736)>368 then return d else return d(l(l,n,l),n(l,l,d),n(l,n,d and n)and d(n,d,n))end return n(l(n,d and l,n),n(n and n,l,l),d(d,n,l))end,function(d,n,l)if t>350 then return n end t=t+1 e=(e+135)%5357 if(e%682)<=341 then e=(e-511)%16117 return l else return l(d(n,l,n),n(d,l,d and d),n(n,l,d and l))end return l(l(d,n,l),l(n,d,n),d(n,n,n))end,function(n,l,d)if t>274 then return l end t=t+1 e=(e-823)%29292 if(e%1790)>895 then e=(e+934)%17751 return l else return n(n(d,n,n),n(l,n,l),l(l,l,n))end return n(n(d,d,d),d(l,l,n),l(l and d,d,n))end)return e;end)())local de=(getfenv)or(function()return _ENV end);local c=a.QCHxOmRx or a.qlz_RxTr;local t=3;local d=2;local _=1;local f=4;local function ee(b,...)local u=o(e,"J#IM5r08&{g-Ae.^Au0&#AeE&85r.Ag?r508#M.r8&I#A.{GreI#e*0#o&.rI^.r{55&^AI*A88{M&.AM8^8{ArYS5eA.8&IMr^-g#5r#0A5&{^^e^&errAe58#.gA0(#5I#.-gra5^A--IzIIe8{K^k.A{{0I=r850{#^eM&{5-^^0E0&#88A&5IA.#{^FnU8g-0.#{e5&A^g&M5{.&{Arm.0rMbx5q#rA-8^Mr^8g-IAc5-{80Irer&&#&&.^-g&A-{gMT.5{&I.{-5&&&0^MM^0g#rA#5855eM5er&85e+og{0M#08ArrM0.g{-rI-5Ig{85508IGAA&uM5rA(-AM8&Iger&.M-&-r{^;g5r&0oI&ee{-^A^#-&0A##Ae&5MA{A{&5r_-0A0I#{Ae&g^:^>g8rM*8-{0A.g8M5-e&&A545&#1Ar&M.5e.{r5A^{0&8M##e8M&MA^IgMrA #-M8&#eei545-^#-=r&A5gr8-I^.I8-5#^M055.e^0M50A&8AM<M5Y5-#0#I8AeMAMM^Mg00vk#-88AeA.5&AMegA-Mr8#gAr&nM&{&{-r8+Ige0.e4e&&8.A^I{{r{##-r88IA&A&#M8.-g#0M#8&0R^e{85I&eAee-M08#g-M8{I-e-&Mr&Ug-r0.#-e-05M{.&{Ar#B.{r8AMS.II8ee&A51^5#&A.8{MI.ArA.}{55&^AA505#&AA&#M5.&{A0II/-&0AIxe^&&MA^n-085qAAq85I{eA{ 55#.-r0d#5A&&IMz.r{&rr/)-&88#Aew&5M..Ag#r5K&e-8GI5e&&e5s^5g&r.5IA58&IA.#{55&^A-:&e#&Ae&mM5.&{ArFm5A&0AI#e5&{MA^Ig50gI8Ax80I&e^{c55^&gA0.#5A-8AM#.5{&5AOm-{0&#.eG&0M&.^g;00#&-A8MI5eg&A5j^5g.&{#vA&8&IA.b{r5&^e-L05M#AA&XM5.g{Arsh5-&{5IPe8&&M.^Ng&r&#IAI85I-eAgM55^{gA0##5AA&-M6.5{&r^qP-r0&ISe^&5M&.AAMr5*{-A&II{e&{#5*^0g&rA#iAggrIA.0{55g^A-#05#{AA&?5e.&{ArUq&-&0AISe5--MA^rg5rghAA085I.^8{Z5{^&A00%#rA&8AMT.&g85A76-5&I#Ae#&5MA^-g}r5d&.-8dIre&{.5r^5g^rA#AA58&IA^Ig55&S5-c0g#&AA&nM5^A{Ar8_5-g0AI#e5{grI^mg-r&#&A)85I&..g-55NGgA08#5A&8AMB^e{&rrSU-g0&#AeH&5Mg.Ag&r5##-A8KI5e&{05)^-g&rA#PAr8&Mp.^{55&^Ae^05#{AA{IM{.&g#rm#?-&0AIB.0geMA^0g5reOAAi85I&^5{H5{^&g.01#rA&&.5I.5{e5AsA-50&#A.I{&M&^Ig,rAB&-A8HI5e^&A5r^5ggrA##A5&g55.L{{5&}&-R05#&e.{IM5..{Ar5F5-&0AIb#:&&5#^hg0r&9eAC&0M#eA{r55V5gA0%#5eg&eMk.g{&r03u-50&#Ae&&5Me.AgIr5K{-A835Me&&A5=^rg&rA#HA58-IA.6{55g^A-X05#-e%&jM5.&fM-#8##e0^I8e5&&MAM&#&AA8AZ8e{{A.I{d55^&-.8-#5A&8AM#.5{&5AIo-{0&#Ae?&5M&..gwr5#^-A8II5e&&A54^5g&80#xA58&I..9{55&^A-005#&AA&%M5.&{ArCh^-&0AIuer&&MA^Cg5r&jAA385MIeA{t55^-g^0F#5A&.^gr50{-rs?=-50&&MM#^#{e.^g#r5T&-AA^I8e^&A5G^5O^A#&5IA.^{r55{8r8^A-C058^M#^5{{0cH#-M8{IAe-{I5I.{g{rrg80LyAAB85{A5-_M-&0g#rA.8-A-&5M4.5{&A#0.#^e0&-58^I{8.^grr5!&-A-g{MMgerg5^0g&rA#aA58&IAeFeM5g^A-/05#&AA&ar5I&AIrpo5-&8.Ire5&&MA^5g5r&yAA08.I&eA{35&^&ge0z#rA&&GM^.5{&5A15-50{#Ae5{MM&.AgPrA!&-e8 M0ee&A5_^5gArA#+A58&0I.({55&^e-E05#&AA{MM5.&{ArWv5-&0AI5.M&&MA^4A{r&beA+&0IeeA{455^egA0?#5A.&0MT.5{&r&nU-r0&#eeT&&58.Agpr5#5-A8#I5eA{-5v^5g&80#>Ar8&M..r{55&^A-r05#&AA&S5I.&{ArR)r-&0.I6.0grMA^#g5r-mAAV85Mge.{>50^&-I0m#5A&&.M-.5{-5AuI-50&#A^B{-M&.^gUr8*&A58GI5.8&A5I^5ggrA#IA5{&M^. {05&^.->0r#&e.&AM5.A{Ar{c5-&0AMI.r&&5#^Bg.r&?AAs855#eA{I55^egA0I#5A&&&Mh.5{&5AQZ-00&#Ae^&5M&.AgIr5N&-A85M^e&&A5>#{g&re#(e0&5IA.?{55^^A-L05IgV+&FMr.&gIrPw5-&8.IIe5&gMA^Ig5r&kA.78.I&e.{*50^&-50d#5eM8AM#.5{g5AyI-5&&I{e%&rM&.egcrrw&A.8.I5e-&A5{^5g&rAIIe58&MO.2{.5&^A-p05M5AA&#M5.A{ArIa5-&{MI_e5&&MA^*grr&WAAM85I&eA{I55^&gA0!MMA&8AMK.r{&5A3%-50&#AeB&5M{.Ag*r5w-A08TI5e&^&g^rr;AA^&5M0.#{g58{{5&^A-_80rMAA&>M5.{{ArkZ5-&80Iyer&&MA^pg5r&DAeM85I&eA{I55^ggA0PIiA&8AMb.r{&5eSU-58.#Ae9&5M{.AgFr5l&-A8}I5e&");local n=0;a.DlFpPgRf(function()n=n+1 end)local function e(l,e)if e then return n end;n=l+n;end local l,n,h=r(0,r,e,u,a.fofUaGi_);local function o()local l,n=a.fofUaGi_(u,e(1,3),e(5,6)+2);e(2);return(n*256)+l;end;local g=true;local g=0 local function m()local d=n();local e=n();local t=1;local d=(l(e,1,20)*(2^32))+d;local n=l(e,21,31);local e=((-1)^l(e,32));if(n==0)then if(d==g)then return e*0;else n=1;t=0;end;elseif(n==2047)then return(d==0)and(e*(1/0))or(e*(0/0));end;return a.qVEgjPVD(e,n-1023)*(t+(d/(2^52)));end;local k=n;local function p(n)local l;if(not n)then n=k();if(n==0)then return'';end;end;l=a.mCsSuhuD(u,e(1,3),e(5,6)+n-1);e(n)local e=""for n=(1+g),#l do e=e..a.mCsSuhuD(l,n,n)end return e;end;local k=#a.prcbIDkk(s('\49.\48'))~=1 local e=n;local function te(...)return{...},a.ewkzYOqd('#',...)end local function ee()local e={};local g={};local u={};local s={g,u,nil,e};local e=n()local c={}for d=1,e do local l=h();local n;if(l==0)then n=(h()~=#{});elseif(l==2)then local e=m();if k and a.dVVaDhdG(a.prcbIDkk(e),'.(\48+)$')then e=a.ActLaQJO(e);end n=e;elseif(l==3)then n=p();end;c[d]=n;end;for u=1,n()do local e=h();if(l(e,1,1)==0)then local r=l(e,2,3);local a=l(e,4,6);local e={o(),o(),nil,nil};if(r==0)then e[t]=o();e[f]=o();elseif(r==#{1})then e[t]=n();elseif(r==b[2])then e[t]=n()-(2^16)elseif(r==b[3])then e[t]=n()-(2^16)e[f]=o();end;if(l(a,1,1)==1)then e[d]=c[e[d]]end if(l(a,2,2)==1)then e[t]=c[e[t]]end if(l(a,3,3)==1)then e[f]=c[e[f]]end g[u]=e;end end;s[3]=h();for e=1,n()do u[e-(#{1})]=ee();end;return s;end;local function ne(l,n,e)local d=n;local d=e;return s(a.dVVaDhdG(a.dVVaDhdG(({a.DlFpPgRf(l)})[2],n),e))end local function b(z,s,h)local function le(...)local o,k,p,ne,m,l,u,ee,y,j,g,n;local e=0;while-1<e do if 2>=e then if 1>e then o=r(6,87,1,75,z);k=r(6,55,2,15,z);else if e<2 then p=r(6,2,3,84,z);m=te ne=0;else l=-41;u=-1;end end else if e<5 then if 4==e then j=a.ewkzYOqd('#',...)-1;g={};else ee={};y={...};end else if 5==e then n=r(7);else e=-2;end end end e=e+1;end;for e=0,j do if(e>=p)then ee[e-p]=y[e+1];else n[e]=y[e+1];end;end;local e=j-p+1 local e;local r;local function p(...)while true do end end while true do if l<-40 then l=l+42 end e=o[l];r=e[_];if 34<=r then if 51>r then if r<42 then if r>37 then if r>39 then if r>37 then repeat if r<41 then local a,h,r;for c=0,1 do if-4~=c then for u=24,69 do if c<1 then a=e[d]h={n[a](n[a+1])};r=0;for e=a,e[f]do r=r+1;n[e]=h[r];end l=l+1;e=o[l];break;end;if not n[e[d]]then l=l+1;else l=e[t];end;break;end;else a=e[d]h={n[a](n[a+1])};r=0;for e=a,e[f]do r=r+1;n[e]=h[r];end l=l+1;e=o[l];end end break;end;local u,c,r;for a=0,5 do if 2<a then if a<4 then n[e[d]]=n[e[t]];l=l+1;e=o[l];else if 3<=a then repeat if 5>a then c=e[t];r=n[c]for e=c+1,e[f]do r=r..n[e];end;n[e[d]]=r;l=l+1;e=o[l];break;end;n[e[d]]=h[e[t]];until true;else c=e[t];r=n[c]for e=c+1,e[f]do r=r..n[e];end;n[e[d]]=r;l=l+1;e=o[l];end end else if a<1 then n[e[d]]=n[e[t]];l=l+1;e=o[l];else if-3~=a then repeat if 1<a then n(e[d],e[t]);l=l+1;e=o[l];break;end;u=e[d]n[u]=n[u]()l=l+1;e=o[l];until true;else n(e[d],e[t]);l=l+1;e=o[l];end end end end until true;else local r,h,a;for c=0,1 do if-4~=c then for u=24,69 do if c<1 then r=e[d]h={n[r](n[r+1])};a=0;for e=r,e[f]do a=a+1;n[e]=h[a];end l=l+1;e=o[l];break;end;if not n[e[d]]then l=l+1;else l=e[t];end;break;end;else r=e[d]h={n[r](n[r+1])};a=0;for e=r,e[f]do a=a+1;n[e]=h[a];end l=l+1;e=o[l];end end end else if r<39 then local s,c,u,r,a,h,o;local l=0;while l>-1 do if l<3 then if l>0 then if l>=-1 then repeat if l~=1 then a=r[c];break;end;r=e;until true;else a=r[c];end else s=d;c=t;u=f;end else if l>4 then if l>=1 then repeat if l~=5 then l=-2;break;end;n[h]=o;until true;else n[h]=o;end else if 4==l then o=n[a];for e=1+a,r[u]do o=o..n[e];end;else h=r[s];end end end l=l+1 end else local t=e[t];local l=n[t]for e=t+1,e[f]do l=l..n[e];end;n[e[d]]=l;end end else if 36<=r then if 35<=r then for a=39,81 do if r~=36 then local f,a,g,s,c,u,r;for r=0,6 do if r>2 then if r<=4 then if r>=1 then repeat if 3~=r then f=e[d]n[f](n[f+1])l=l+1;e=o[l];break;end;r=0;while r>-1 do if 3<=r then if r>4 then if 2~=r then repeat if 5<r then r=-2;break;end;n(u,c);until true;else n(u,c);end else if r==4 then u=a[g];else c=a[s];end end else if 1>r then a=e;else if 1~=r then s=t;else g=d;end end end r=r+1 end l=l+1;e=o[l];until true;else r=0;while r>-1 do if 3<=r then if r>4 then if 2~=r then repeat if 5<r then r=-2;break;end;n(u,c);until true;else n(u,c);end else if r==4 then u=a[g];else c=a[s];end end else if 1>r then a=e;else if 1~=r then s=t;else g=d;end end end r=r+1 end l=l+1;e=o[l];end else if 2<=r then repeat if 6>r then n[e[d]]=h[e[t]];l=l+1;e=o[l];break;end;n(e[d],e[t]);until true;else n[e[d]]=h[e[t]];l=l+1;e=o[l];end end else if 1<=r then if r~=2 then f=e[d]n[f](n[f+1])l=l+1;e=o[l];else n[e[d]]=h[e[t]];l=l+1;e=o[l];end else n(e[d],e[t]);l=l+1;e=o[l];end end end break;end;if(n[e[d]]~=e[f])then l=l+1;else l=e[t];end;break;end;else if(n[e[d]]~=e[f])then l=l+1;else l=e[t];end;end else if r>30 then for l=10,59 do if r>34 then n[e[d]]=(e[t]~=0);break;end;n[e[d]]=s[e[t]];break;end;else n[e[d]]=(e[t]~=0);end end end else if 45<r then if r>47 then if 49>r then n[e[d]]=(e[t]~=0);else if 50~=r then local l=e[d]local t={n[l](n[l+1])};local d=0;for e=l,e[f]do d=d+1;n[e]=t[d];end else n[e[d]]=b(k[e[t]],nil,h);end end else if r~=43 then for l=40,70 do if r>46 then local e=e[d]local d,l=m(n[e](n[e+1]))u=l+e-1 local l=0;for e=e,u do l=l+1;n[e]=d[l];end;break;end;local r,o,a,h,f;local l=0;while l>-1 do if l<=2 then if 1>l then r=e;else if l>=-2 then repeat if l~=1 then a=t;break;end;o=d;until true;else a=t;end end else if 4<l then if 5~=l then l=-2;else n(f,h);end else if 1<=l then repeat if l~=3 then f=r[o];break;end;h=r[a];until true;else f=r[o];end end end l=l+1 end break;end;else local r,a,o,h,f;local l=0;while l>-1 do if l<=2 then if 1>l then r=e;else if l>=-2 then repeat if l~=1 then o=t;break;end;a=d;until true;else o=t;end end else if 4<l then if 5~=l then l=-2;else n(f,h);end else if 1<=l then repeat if l~=3 then f=r[a];break;end;h=r[o];until true;else f=r[a];end end end l=l+1 end end end else if r>=44 then if r~=45 then local d=e[d]local t={n[d](n[d+1])};local l=0;for e=d,e[f]do l=l+1;n[e]=t[l];end else local u=k[e[t]];local c;local r={};c=a.QOUhgzOb({},{__index=function(n,e)local e=r[e];return e[1][e[2]];end,__newindex=function(l,e,n)local e=r[e]e[1][e[2]]=n;end;});for d=1,e[f]do l=l+1;local e=o[l];if e[_]==25 then r[d-1]={n,e[t]};else r[d-1]={s,e[t]};end;g[#g+1]=r;end;n[e[d]]=b(u,c,h);end else if 41<r then repeat if r~=42 then local d=e[d];local l=n[e[t]];n[d+1]=l;n[d]=l[e[f]];break;end;local e=e[d]n[e]=n[e]()until true;else local l=e[d];local d=n[e[t]];n[l+1]=d;n[l]=d[e[f]];end end end end else if 59>r then if 55>r then if r<=52 then if 48<=r then for a=31,57 do if r<52 then local a,h,r;for c=0,1 do if c==0 then a=e[d]h={n[a](n[a+1])};r=0;for e=a,e[f]do r=r+1;n[e]=h[r];end l=l+1;e=o[l];else if n[e[d]]then l=l+1;else l=e[t];end;end end break;end;local a,g,c,b,k,s,u,r;for r=0,6 do if 3<=r then if r<=4 then if r>2 then repeat if r>3 then a=e[d];g=n[e[t]];n[a+1]=g;n[a]=g[e[f]];l=l+1;e=o[l];break;end;a=e[d]n[a]=n[a](n[a+1])l=l+1;e=o[l];until true;else a=e[d];g=n[e[t]];n[a+1]=g;n[a]=g[e[f]];l=l+1;e=o[l];end else if r==5 then r=0;while r>-1 do if 3<=r then if r<5 then if r>=1 then repeat if 4>r then s=c[k];break;end;u=c[b];until true;else u=c[b];end else if 2<r then repeat if r>5 then r=-2;break;end;n(u,s);until true;else r=-2;end end else if 1>r then c=e;else if 1~=r then k=t;else b=d;end end end r=r+1 end l=l+1;e=o[l];else r=0;while r>-1 do if r<=2 then if 0<r then if-3<=r then repeat if 1<r then k=t;break;end;b=d;until true;else b=d;end else c=e;end else if r<=4 then if r>=1 then repeat if 3<r then u=c[b];break;end;s=c[k];until true;else s=c[k];end else if 3<r then for e=38,79 do if r~=5 then r=-2;break;end;n(u,s);break;end;else n(u,s);end end end r=r+1 end end end else if r<1 then n[e[d]]=h[e[t]];l=l+1;e=o[l];else if-2~=r then for a=24,61 do if r~=1 then n[e[d]]=n[e[t]][e[f]];l=l+1;e=o[l];break;end;n[e[d]]=h[e[t]];l=l+1;e=o[l];break;end;else n[e[d]]=h[e[t]];l=l+1;e=o[l];end end end end break;end;else local r,h,a;for c=0,1 do if c==0 then r=e[d]h={n[r](n[r+1])};a=0;for e=r,e[f]do a=a+1;n[e]=h[a];end l=l+1;e=o[l];else if n[e[d]]then l=l+1;else l=e[t];end;end end end else if r>52 then repeat if r~=53 then do return n[e[d]]();end;break;end;local e=e[d]n[e]=n[e]()until true;else local e=e[d]n[e]=n[e]()end end else if r>=57 then if 54~=r then repeat if 57<r then if n[e[d]]then l=l+1;else l=e[t];end;break;end;do return end;until true;else if n[e[d]]then l=l+1;else l=e[t];end;end else if 54<=r then for o=16,76 do if 56~=r then if not n[e[d]]then l=l+1;else l=e[t];end;break;end;h[e[t]]=n[e[d]];break;end;else h[e[t]]=n[e[d]];end end end else if r<63 then if 60<r then if 57~=r then repeat if r~=61 then local e=e[d]n[e]=n[e](n[e+1])break;end;local e=e[d]n[e]=n[e](n[e+1])until true;else local e=e[d]n[e]=n[e](n[e+1])end else if 60==r then local e=e[d]n[e](n[e+1])else local r;n[e[d]]=h[e[t]];l=l+1;e=o[l];n[e[d]]=s[e[t]];l=l+1;e=o[l];r=e[d]n[r]=n[r](n[r+1])l=l+1;e=o[l];n[e[d]]();l=l+1;e=o[l];do return end;end end else if 65<=r then if 66>r then local l=e[d];do return n[l](c(n,l+1,e[t]))end;else if r>=64 then for c=42,73 do if 66<r then local u=k[e[t]];local c;local r={};c=a.QOUhgzOb({},{__index=function(n,e)local e=r[e];return e[1][e[2]];end,__newindex=function(l,e,n)local e=r[e]e[1][e[2]]=n;end;});for d=1,e[f]do l=l+1;local e=o[l];if e[_]==25 then r[d-1]={n,e[t]};else r[d-1]={s,e[t]};end;g[#g+1]=r;end;n[e[d]]=b(u,c,h);break;end;n[e[d]]=b(k[e[t]],nil,h);break;end;else local u=k[e[t]];local c;local r={};c=a.QOUhgzOb({},{__index=function(n,e)local e=r[e];return e[1][e[2]];end,__newindex=function(l,e,n)local e=r[e]e[1][e[2]]=n;end;});for d=1,e[f]do l=l+1;local e=o[l];if e[_]==25 then r[d-1]={n,e[t]};else r[d-1]={s,e[t]};end;g[#g+1]=r;end;n[e[d]]=b(u,c,h);end end else if 60<=r then for o=16,89 do if r<64 then do return n[e[d]]end break;end;l=e[t];break;end;else l=e[t];end end end end end else if 17<=r then if r<25 then if r>=21 then if r<=22 then if r<22 then if(n[e[d]]~=e[f])then l=l+1;else l=e[t];end;else do return n[e[d]]();end;end else if r~=19 then repeat if 24~=r then if n[e[d]]then l=l+1;else l=e[t];end;break;end;n[e[d]]=n[e[t]];until true;else n[e[d]]=n[e[t]];end end else if 18<r then if 20>r then local e=e[d];do return c(n,e,u)end;else for r=0,3 do if 1>=r then if r>0 then h[e[t]]=n[e[d]];l=l+1;e=o[l];else n[e[d]]=(e[t]~=0);l=l+1;e=o[l];end else if r<3 then n[e[d]]=h[e[t]];l=l+1;e=o[l];else if(n[e[d]]~=e[f])then l=l+1;else l=e[t];end;end end end end else if 14<=r then for a=12,70 do if r~=18 then local a,h,r;n(e[d],e[t]);l=l+1;e=o[l];a=e[d]n[a]=n[a](c(n,a+1,e[t]))l=l+1;e=o[l];h=e[t];r=n[h]for e=h+1,e[f]do r=r..n[e];end;n[e[d]]=r;l=l+1;e=o[l];do return n[e[d]]end l=l+1;e=o[l];l=e[t];break;end;n[e[d]]=s[e[t]];break;end;else local a,h,r;n(e[d],e[t]);l=l+1;e=o[l];a=e[d]n[a]=n[a](c(n,a+1,e[t]))l=l+1;e=o[l];h=e[t];r=n[h]for e=h+1,e[f]do r=r..n[e];end;n[e[d]]=r;l=l+1;e=o[l];do return n[e[d]]end l=l+1;e=o[l];l=e[t];end end end else if 29>r then if 27>r then if r<26 then n[e[d]]=n[e[t]];else h[e[t]]=n[e[d]];end else if r>27 then local l=e[d]n[l]=n[l](c(n,l+1,e[t]))else local r,a;n[e[d]]=h[e[t]];l=l+1;e=o[l];r=e[d];a=n[e[t]];n[r+1]=a;n[r]=a[e[f]];l=l+1;e=o[l];n[e[d]]=s[e[t]];l=l+1;e=o[l];r=e[d];do return n[r](c(n,r+1,e[t]))end;l=l+1;e=o[l];r=e[d];do return c(n,r,u)end;l=l+1;e=o[l];do return end;end end else if r>=31 then if r<32 then do return end;else if 30<=r then for l=28,68 do if r~=32 then local l=e[d];local d=n[e[t]];n[l+1]=d;n[l]=d[e[f]];break;end;n[e[d]]=n[e[t]][e[f]];break;end;else local d=e[d];local l=n[e[t]];n[d+1]=l;n[d]=l[e[f]];end end else if r~=28 then repeat if r~=29 then local e=e[d]n[e](c(n,e+1,u))break;end;n[e[d]]=n[e[t]][e[f]];until true;else local e=e[d]n[e](c(n,e+1,u))end end end end else if 7<r then if r<12 then if 10<=r then if 11>r then if not n[e[d]]then l=l+1;else l=e[t];end;else local e=e[d];do return c(n,e,u)end;end else if 5~=r then for f=39,70 do if r~=8 then local r;for f=0,2 do if f<=0 then n[e[d]]=h[e[t]];l=l+1;e=o[l];else if f>=0 then for a=44,70 do if f>1 then r=e[d]n[r](n[r+1])break;end;n(e[d],e[t]);l=l+1;e=o[l];break;end;else r=e[d]n[r](n[r+1])end end end break;end;n[e[d]]();break;end;else local r;for f=0,2 do if f<=0 then n[e[d]]=h[e[t]];l=l+1;e=o[l];else if f>=0 then for a=44,70 do if f>1 then r=e[d]n[r](n[r+1])break;end;n(e[d],e[t]);l=l+1;e=o[l];break;end;else r=e[d]n[r](n[r+1])end end end end end else if r<14 then if r~=13 then local r,o,f,a,h;local l=0;while l>-1 do if l<=2 then if l<=0 then r=e;else if 2==l then f=t;else o=d;end end else if l<=4 then if l~=3 then h=r[o];else a=r[f];end else if 3<=l then repeat if 6>l then n(h,a);break;end;l=-2;until true;else l=-2;end end end l=l+1 end else local e=e[d]local d,l=m(n[e](n[e+1]))u=l+e-1 local l=0;for e=e,u do l=l+1;n[e]=d[l];end;end else if 14<r then if 11<r then for f=43,79 do if 16>r then l=e[t];break;end;local r,a,s,f;n(e[d],e[t]);l=l+1;e=o[l];r=e[d]n[r](n[r+1])l=l+1;e=o[l];n[e[d]]=h[e[t]];l=l+1;e=o[l];n[e[d]]=h[e[t]];l=l+1;e=o[l];n[e[d]]=n[e[t]];l=l+1;e=o[l];r=e[d]a,s=m(n[r](n[r+1]))u=s+r-1 f=0;for e=r,u do f=f+1;n[e]=a[f];end;l=l+1;e=o[l];r=e[d]n[r](c(n,r+1,u))break;end;else l=e[t];end else local r,a;r=e[d]n[r]=n[r]()l=l+1;e=o[l];n(e[d],e[t]);l=l+1;e=o[l];n[e[d]]=h[e[t]];l=l+1;e=o[l];n[e[d]]=h[e[t]];l=l+1;e=o[l];n[e[d]]=n[e[t]][e[f]];l=l+1;e=o[l];r=e[d]n[r]=n[r](n[r+1])l=l+1;e=o[l];r=e[d];a=n[e[t]];n[r+1]=a;n[r]=a[e[f]];end end end else if 4<=r then if r<6 then if 1<=r then for l=42,78 do if 5~=r then local l=e[d]n[l]=n[l](c(n,l+1,e[t]))break;end;n[e[d]]=h[e[t]];break;end;else local l=e[d]n[l]=n[l](c(n,l+1,e[t]))end else if 6<r then local l=e[d];do return n[l](c(n,l+1,e[t]))end;else local e=e[d]n[e](c(n,e+1,u))end end else if r>=2 then if r~=3 then local e=e[d]n[e](n[e+1])else do return n[e[d]]end end else if-1<r then repeat if r>0 then n[e[d]]=h[e[t]];break;end;n[e[d]]();until true;else n[e[d]]();end end end end end end l=1+l;end;end;return le end;local d=0xff;local a={};local r=(1);local t='';(function(n)local l=n local o=0x00 local e=0x00 l={(function(r)if o>0x1e then return r end o=o+1 e=(e+0xa04-r)%0xd return(e%0x03==0x1 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x7b);end return true end)'I_Lbg'and l[0x2](0x10e+r))or(e%0x03==0x0 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xd7);end return true end)'HQXRh'and l[0x1](r+0x226))or(e%0x03==0x2 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xa6);t='\37';d={function()d()end};t=t..'\100\43';end return true end)'CxGVb'and l[0x3](r+0x11d))or r end),(function(f)if o>0x31 then return f end o=o+1 e=(e+0x534-f)%0x41 return(e%0x03==0x2 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x50);a[r]=de();r=r+d;end return true end)'vifVo'and l[0x1](0x38b+f))or(e%0x03==0x1 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xe6);end return true end)'pkUBo'and l[0x2](f+0x33a))or(e%0x03==0x0 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x31);d[2]=(d[2]*(ne(function()a()end,c(t))-ne(d[1],c(t))))+1;a[r]={};d=d[2];r=r+d;end return true end)'nezQz'and l[0x3](f+0x64))or f end),(function(f)if o>0x2e then return f end o=o+1 e=(e+0xce6-f)%0x4d return(e%0x03==0x0 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xba);end return true end)'zCDXg'and l[0x1](0x213+f))or(e%0x03==0x2 and(function(l)if not n[l]then e=e+0x01 n[l]=(0xbe);t={t..'\58 a',t};a[r]=ee();r=r+(1);t[1]='\58'..t[1];d[2]=0xff;end return true end)'wjCTg'and l[0x2](f+0x2f5))or(e%0x03==0x1 and(function(l)if not n[l]then e=e+0x01 n[l]=(0x11);end return true end)'iBeQR'and l[0x3](f+0x39f))or f end)}l[0x1](0x1427)end){};local e=b(c(a));return e(...);end return ee((function()local n={}local e=0x01;local l;if a.yfX_kvRE then l=a.yfX_kvRE(ee)else l=''end if a.dVVaDhdG(l,a.ZifYgXAk)then e=e+0;else e=e+1;end n[e]=0x02;n[n[e]+0x01]=0x03;return n;end)(),...)end)((function(e,l,n,d,t,r)local r;if e<4 then if e<2 then if e~=-4 then repeat if 0<e then do return function(n,e,l)if l then local e=(n/2^(e-1))%2^((l-1)-(e-1)+1);return e-e%1;else local e=2^(e-1);return(n%(e+e)>=e)and 1 or 0;end;end;end;break;end;do return l(1),l(4,t,d,n,l),l(5,t,d,n)end;until true;else do return function(n,e,l)if l then local e=(n/2^(e-1))%2^((l-1)-(e-1)+1);return e-e%1;else local e=2^(e-1);return(n%(e+e)>=e)and 1 or 0;end;end;end;end else if 3>e then do return 16777216,65536,256 end;else do return l(1),l(4,t,d,n,l),l(5,t,d,n)end;end end else if e<=5 then if 0<e then for r=44,87 do if e~=4 then local e=d;do return function()local n=l(n,e(e,e),e(e,e));e(1);return n;end;end;break;end;local e=d;local t,r,d=t(2);do return function()local n,l,o,f=l(n,e(e,e),e(e,e)+3);e(4);return(f*t)+(o*r)+(l*d)+n;end;end;break;end;else local e=d;do return function()local n=l(n,e(e,e),e(e,e));e(1);return n;end;end;end else if 7<=e then if 5<=e then repeat if e~=7 then do return n(e,nil,n);end break;end;do return setmetatable({},{['__\99\97\108\108']=function(e,d,l,t,n)if n then return e[n]elseif t then return e else e[d]=l end end})end until true;else do return n(e,nil,n);end end else do return t[n]end;end end end end),...)`;
      
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
