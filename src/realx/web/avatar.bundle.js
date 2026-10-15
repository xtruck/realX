(()=>{var Ai="178";var J0=0,Tf=1,Q0=2;var bf=1,e_=2,Wi=3,bi=0,dn=1,Sn=2,vr=0,ys=1,wf=2,Af=3,Rf=4,t_=5,zr=100,n_=101,i_=102,r_=103,s_=104,o_=200,a_=201,l_=202,c_=203,Hc=204,Vc=205,u_=206,h_=207,d_=208,f_=209,p_=210,m_=211,g_=212,__=213,v_=214,ru=0,su=1,ou=2,Ms=3,au=4,lu=5,cu=6,uu=7,Cf=0,x_=1,y_=2,xr=0,M_=1,E_=2,S_=3,T_=4,b_=5,w_=6,A_=7,ff="attached",R_="detached",If=300,Ls=301,Us=302,hu=303,du=304,ml=306,Gr=1e3,Oi=1001,yo=1002,un=1003,fu=1004;var Ns=1005;var Mn=1006,No=1007;var Ri=1008;var Ci=1009,Pf=1010,Lf=1011,Do=1012,pu=1013,Xr=1014,oi=1015,Oo=1016,mu=1017,gu=1018,Fo=1020,Uf=35902,Nf=1021,Df=1022,Yn=1023,Mo=1026,Bo=1027,_u=1028,vu=1029,Of=1030,xu=1031;var yu=1033,gl=33776,_l=33777,vl=33778,xl=33779,Mu=35840,Eu=35841,Su=35842,Tu=35843,bu=36196,wu=37492,Au=37496,Ru=37808,Cu=37809,Iu=37810,Pu=37811,Lu=37812,Uu=37813,Nu=37814,Du=37815,Ou=37816,Fu=37817,Bu=37818,ku=37819,Hu=37820,Vu=37821,yl=36492,zu=36494,Gu=36495,Ff=36283,Wu=36284,Xu=36285,qu=36286;var Es=2300,Ss=2301,kc=2302,pf=2400,mf=2401,gf=2402,C_=2500;var Bf=0,Ml=1,ko=2,I_=3200,P_=3201;var El=0,L_=1,yr="",Qt="srgb",hn="srgb-linear",Xa="linear",Mt="srgb";var xs=7680;var _f=519,U_=512,N_=513,D_=514,kf=515,O_=516,F_=517,B_=518,k_=519,zc=35044,Hf=35048;var Vf="300 es",Fi=2e3,qa=2001;var dr=class{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let n=this._listeners;if(n===void 0)return;let i=n[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},fn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],g0=1234567,Ga=Math.PI/180,Ts=180/Math.PI;function Ti(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(fn[t&255]+fn[t>>8&255]+fn[t>>16&255]+fn[t>>24&255]+"-"+fn[e&255]+fn[e>>8&255]+"-"+fn[e>>16&15|64]+fn[e>>24&255]+"-"+fn[n&63|128]+fn[n>>8&255]+"-"+fn[n>>16&255]+fn[n>>24&255]+fn[i&255]+fn[i>>8&255]+fn[i>>16&255]+fn[i>>24&255]).toLowerCase()}function Qe(t,e,n){return Math.max(e,Math.min(n,t))}function zf(t,e){return(t%e+e)%e}function HE(t,e,n,i,r){return i+(t-e)*(r-i)/(n-e)}function VE(t,e,n){return t!==e?(n-t)/(e-t):0}function Wa(t,e,n){return(1-n)*t+n*e}function zE(t,e,n,i){return Wa(t,e,1-Math.exp(-n*i))}function GE(t,e=1){return e-Math.abs(zf(t,e*2)-e)}function WE(t,e,n){return t<=e?0:t>=n?1:(t=(t-e)/(n-e),t*t*(3-2*t))}function XE(t,e,n){return t<=e?0:t>=n?1:(t=(t-e)/(n-e),t*t*t*(t*(t*6-15)+10))}function qE(t,e){return t+Math.floor(Math.random()*(e-t+1))}function YE(t,e){return t+Math.random()*(e-t)}function $E(t){return t*(.5-Math.random())}function jE(t){t!==void 0&&(g0=t);let e=g0+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ZE(t){return t*Ga}function KE(t){return t*Ts}function JE(t){return(t&t-1)===0&&t!==0}function QE(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))}function eS(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function tS(t,e,n,i,r){let s=Math.cos,o=Math.sin,a=s(n/2),l=o(n/2),c=s((e+i)/2),u=o((e+i)/2),h=s((e-i)/2),d=o((e-i)/2),f=s((i-e)/2),g=o((i-e)/2);switch(r){case"XYX":t.set(a*u,l*h,l*d,a*c);break;case"YZY":t.set(l*d,a*u,l*h,a*c);break;case"ZXZ":t.set(l*h,l*d,a*u,a*c);break;case"XZX":t.set(a*u,l*g,l*f,a*c);break;case"YXY":t.set(l*f,a*u,l*g,a*c);break;case"ZYZ":t.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Si(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function yt(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}var gt={DEG2RAD:Ga,RAD2DEG:Ts,generateUUID:Ti,clamp:Qe,euclideanModulo:zf,mapLinear:HE,inverseLerp:VE,lerp:Wa,damp:zE,pingpong:GE,smoothstep:WE,smootherstep:XE,randInt:qE,randFloat:YE,randFloatSpread:$E,seededRandom:jE,degToRad:ZE,radToDeg:KE,isPowerOfTwo:JE,ceilPowerOfTwo:QE,floorPowerOfTwo:eS,setQuaternionFromProperEuler:tS,normalize:yt,denormalize:Si},Ye=class t{constructor(e=0,n=0){t.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Qe(this.x,e.x,n.x),this.y=Qe(this.y,e.y,n.y),this}clampScalar(e,n){return this.x=Qe(this.x,e,n),this.y=Qe(this.y,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Qe(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(Qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){let i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},he=class{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],d=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[n+0]=l,e[n+1]=c,e[n+2]=u,e[n+3]=h;return}if(a===1){e[n+0]=d,e[n+1]=f,e[n+2]=g,e[n+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-a,p=l*d+c*f+u*g+h*_,E=p>=0?1:-1,T=1-p*p;if(T>Number.EPSILON){let C=Math.sqrt(T),A=Math.atan2(C,p*E);m=Math.sin(m*A)/C,a=Math.sin(a*A)/C}let v=a*E;if(l=l*m+d*v,c=c*m+f*v,u=u*m+g*v,h=h*m+_*v,m===1-a){let C=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=C,c*=C,u*=C,h*=C}}e[n]=l,e[n+1]=c,e[n+2]=u,e[n+3]=h}static multiplyQuaternionsFlat(e,n,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return e[n]=a*g+u*h+l*f-c*d,e[n+1]=l*g+u*d+c*h-a*f,e[n+2]=c*g+u*f+a*d-l*h,e[n+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),d=l(i/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){let i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let n=e.elements,i=n[0],r=n[4],s=n[8],o=n[1],a=n[5],l=n[9],c=n[2],u=n[6],h=n[10],d=i+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Qe(this.dot(e),-1,1)))}rotateTowards(e,n){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){let i=e._x,r=e._y,s=e._z,o=e._w,a=n._x,l=n._y,c=n._z,u=n._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-n;return this._w=f*o+n*this._w,this._x=f*i+n*this._x,this._y=f*r+n*this._y,this._z=f*s+n*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-n)*u)/c,d=Math.sin(n*u)/c;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){let e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},w=class t{constructor(e=0,n=0,i=0){t.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(_0.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(_0.setFromAxisAngle(e,n))}applyMatrix3(e){let n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let n=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let n=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*n-s*r),h=2*(s*i-o*n);return this.x=n+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Qe(this.x,e.x,n.x),this.y=Qe(this.y,e.y,n.y),this.z=Qe(this.z,e.z,n.z),this}clampScalar(e,n){return this.x=Qe(this.x,e,n),this.y=Qe(this.y,e,n),this.z=Qe(this.z,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Qe(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){let i=e.x,r=e.y,s=e.z,o=n.x,a=n.y,l=n.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let n=e.lengthSq();if(n===0)return this.set(0,0,0);let i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return kd.copy(this).projectOnVector(e),this.sub(kd)}reflect(e){return this.sub(kd.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(Qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){let r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){let n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},kd=new w,_0=new he,Ue=class t{constructor(e,n,i,r,s,o,a,l,c){t.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,o,a,l,c)}set(e,n,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=n,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,r=n.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],f=i[5],g=i[8],_=r[0],m=r[3],p=r[6],E=r[1],T=r[4],v=r[7],C=r[2],A=r[5],b=r[8];return s[0]=o*_+a*E+l*C,s[3]=o*m+a*T+l*A,s[6]=o*p+a*v+l*b,s[1]=c*_+u*E+h*C,s[4]=c*m+u*T+h*A,s[7]=c*p+u*v+h*b,s[2]=d*_+f*E+g*C,s[5]=d*m+f*T+g*A,s[8]=d*p+f*v+g*b,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return n*o*u-n*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,f=c*s-o*l,g=n*h+i*d+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=h*_,e[1]=(r*c-u*i)*_,e[2]=(a*i-r*o)*_,e[3]=d*_,e[4]=(u*n-r*l)*_,e[5]=(r*s-a*n)*_,e[6]=f*_,e[7]=(i*l-c*n)*_,e[8]=(o*n-i*s)*_,this}transpose(){let e,n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+n,0,0,1),this}scale(e,n){return this.premultiply(Hd.makeScale(e,n)),this}rotate(e){return this.premultiply(Hd.makeRotation(-e)),this}translate(e,n){return this.premultiply(Hd.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){let n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Hd=new Ue;function Gf(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Eo(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function H_(){let t=Eo("canvas");return t.style.display="block",t}var v0={};function bs(t){t in v0||(v0[t]=!0,console.warn(t))}function V_(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function z_(t){let e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function G_(t){let e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var x0=new Ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),y0=new Ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function nS(){let t={enabled:!0,workingColorSpace:hn,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===Mt&&(r.r=hr(r.r),r.g=hr(r.g),r.b=hr(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Mt&&(r.r=xo(r.r),r.g=xo(r.g),r.b=xo(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===yr?Xa:this.spaces[r].transfer},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return bs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),t.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return bs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),t.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return t.define({[hn]:{primaries:e,whitePoint:i,transfer:Xa,toXYZ:x0,fromXYZ:y0,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Qt},outputColorSpaceConfig:{drawingBufferColorSpace:Qt}},[Qt]:{primaries:e,whitePoint:i,transfer:Mt,toXYZ:x0,fromXYZ:y0,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Qt}}}),t}var nt=nS();function hr(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function xo(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}var ro,Gc=class{static getDataURL(e,n="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{ro===void 0&&(ro=Eo("canvas")),ro.width=e.width,ro.height=e.height;let r=ro.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=ro}return i.toDataURL(n)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let n=Eo("canvas");n.width=e.width,n.height=e.height;let i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=hr(s[o]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){let n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(hr(n[i]/255)*255):n[i]=hr(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},iS=0,So=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:iS++}),this.uuid=Ti(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let n=this.data;return n instanceof HTMLVideoElement?e.set(n.videoWidth,n.videoHeight):n!==null?e.set(n.width,n.height,n.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Vd(r[o].image)):s.push(Vd(r[o]))}else s=Vd(r);i.url=s}return n||(e.images[this.uuid]=i),i}};function Vd(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?Gc.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var rS=0,zd=new w,an=class t extends dr{constructor(e=t.DEFAULT_IMAGE,n=t.DEFAULT_MAPPING,i=Oi,r=Oi,s=Mn,o=Ri,a=Yn,l=Ci,c=t.DEFAULT_ANISOTROPY,u=yr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rS++}),this.uuid=Ti(),this.name="",this.source=new So(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ye(0,0),this.repeat=new Ye(1,1),this.center=new Ye(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ue,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(zd).x}get height(){return this.source.getSize(zd).y}get depth(){return this.source.getSize(zd).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let n in e){let i=e[n];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let r=this[n];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${n}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[n]=i}}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==If)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Gr:e.x=e.x-Math.floor(e.x);break;case Oi:e.x=e.x<0?0:1;break;case yo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Gr:e.y=e.y-Math.floor(e.y);break;case Oi:e.y=e.y<0?0:1;break;case yo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};an.DEFAULT_IMAGE=null;an.DEFAULT_MAPPING=If;an.DEFAULT_ANISOTROPY=1;var ut=class t{constructor(e=0,n=0,i=0,r=1){t.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let n=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*n+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*n+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*n+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*n+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let T=(c+1)/2,v=(f+1)/2,C=(p+1)/2,A=(u+d)/4,b=(h+_)/4,P=(g+m)/4;return T>v&&T>C?T<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(T),r=A/i,s=b/i):v>C?v<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),i=A/r,s=P/r):C<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(C),i=b/s,r=P/s),this.set(i,r,s,n),this}let E=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-_)/E,this.z=(d-u)/E,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Qe(this.x,e.x,n.x),this.y=Qe(this.y,e.y,n.y),this.z=Qe(this.z,e.z,n.z),this.w=Qe(this.w,e.w,n.w),this}clampScalar(e,n){return this.x=Qe(this.x,e,n),this.y=Qe(this.y,e,n),this.z=Qe(this.z,e,n),this.w=Qe(this.w,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Qe(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Wc=class extends dr{constructor(e=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=i.depth,this.scissor=new ut(0,0,e,n),this.scissorTest=!1,this.viewport=new ut(0,0,e,n);let r={width:e,height:n,depth:i.depth},s=new an(r);this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let n={minFilter:Mn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(n.mapping=e.mapping),e.wrapS!==void 0&&(n.wrapS=e.wrapS),e.wrapT!==void 0&&(n.wrapT=e.wrapT),e.wrapR!==void 0&&(n.wrapR=e.wrapR),e.magFilter!==void 0&&(n.magFilter=e.magFilter),e.minFilter!==void 0&&(n.minFilter=e.minFilter),e.format!==void 0&&(n.format=e.format),e.type!==void 0&&(n.type=e.type),e.anisotropy!==void 0&&(n.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(n.colorSpace=e.colorSpace),e.flipY!==void 0&&(n.flipY=e.flipY),e.generateMipmaps!==void 0&&(n.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(n.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++){this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let r=Object.assign({},e.textures[n].image);this.textures[n].source=new So(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ki=class extends Wc{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}},Ya=class extends an{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Xc=class extends an{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Xn=class{constructor(e=new w(1/0,1/0,1/0),n=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(yi.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(yi.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){let i=yi.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,yi):yi.fromBufferAttribute(s,o),yi.applyMatrix4(e.matrixWorld),this.expandByPoint(yi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),mc.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),mc.copy(i.boundingBox)),mc.applyMatrix4(e.matrixWorld),this.union(mc)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yi),yi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Da),gc.subVectors(this.max,Da),so.subVectors(e.a,Da),oo.subVectors(e.b,Da),ao.subVectors(e.c,Da),Dr.subVectors(oo,so),Or.subVectors(ao,oo),ms.subVectors(so,ao);let n=[0,-Dr.z,Dr.y,0,-Or.z,Or.y,0,-ms.z,ms.y,Dr.z,0,-Dr.x,Or.z,0,-Or.x,ms.z,0,-ms.x,-Dr.y,Dr.x,0,-Or.y,Or.x,0,-ms.y,ms.x,0];return!Gd(n,so,oo,ao,gc)||(n=[1,0,0,0,1,0,0,0,1],!Gd(n,so,oo,ao,gc))?!1:(_c.crossVectors(Dr,Or),n=[_c.x,_c.y,_c.z],Gd(n,so,oo,ao,gc))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(sr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),sr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),sr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),sr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),sr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),sr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),sr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),sr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(sr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},sr=[new w,new w,new w,new w,new w,new w,new w,new w],yi=new w,mc=new Xn,so=new w,oo=new w,ao=new w,Dr=new w,Or=new w,ms=new w,Da=new w,gc=new w,_c=new w,gs=new w;function Gd(t,e,n,i,r){for(let s=0,o=t.length-3;s<=o;s+=3){gs.fromArray(t,s);let a=r.x*Math.abs(gs.x)+r.y*Math.abs(gs.y)+r.z*Math.abs(gs.z),l=e.dot(gs),c=n.dot(gs),u=i.dot(gs);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var sS=new Xn,Oa=new w,Wd=new w,Pn=class{constructor(e=new w,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){let i=this.center;n!==void 0?i.copy(n):sS.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){let i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Oa.subVectors(e,this.center);let n=Oa.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(Oa,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Wd.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Oa.copy(e.center).add(Wd)),this.expandByPoint(Oa.copy(e.center).sub(Wd))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},or=new w,Xd=new w,vc=new w,Fr=new w,qd=new w,xc=new w,Yd=new w,ws=class{constructor(e=new w,n=new w(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,or)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let n=or.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(or.copy(this.origin).addScaledVector(this.direction,n),or.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Xd.copy(e).add(n).multiplyScalar(.5),vc.copy(n).sub(e).normalize(),Fr.copy(this.origin).sub(Xd);let s=e.distanceTo(n)*.5,o=-this.direction.dot(vc),a=Fr.dot(this.direction),l=-Fr.dot(vc),c=Fr.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=s*u,h>=0)if(d>=-g)if(d<=g){let _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Xd).addScaledVector(vc,d),f}intersectSphere(e,n){or.subVectors(e.center,this.origin);let i=or.dot(this.direction),r=or.dot(or)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,n):this.at(a,n)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){let i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){let n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,or)!==null}intersectTriangle(e,n,i,r,s){qd.subVectors(n,e),xc.subVectors(i,e),Yd.crossVectors(qd,xc);let o=this.direction.dot(Yd),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Fr.subVectors(this.origin,e);let l=a*this.direction.dot(xc.crossVectors(Fr,xc));if(l<0)return null;let c=a*this.direction.dot(qd.cross(Fr));if(c<0||l+c>o)return null;let u=-a*Fr.dot(Yd);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},be=class t{constructor(e,n,i,r,s,o,a,l,c,u,h,d,f,g,_,m){t.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,o,a,l,c,u,h,d,f,g,_,m)}set(e,n,i,r,s,o,a,l,c,u,h,d,f,g,_,m){let p=this.elements;return p[0]=e,p[4]=n,p[8]=i,p[12]=r,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new t().fromArray(this.elements)}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){let n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){let n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){let n=this.elements,i=e.elements,r=1/lo.setFromMatrixColumn(e,0).length(),s=1/lo.setFromMatrixColumn(e,1).length(),o=1/lo.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*o,n[9]=i[9]*o,n[10]=i[10]*o,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){let n=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,_=a*h;n[0]=l*u,n[4]=-l*h,n[8]=c,n[1]=f+g*c,n[5]=d-_*c,n[9]=-a*l,n[2]=_-d*c,n[6]=g+f*c,n[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,g=c*u,_=c*h;n[0]=d+_*a,n[4]=g*a-f,n[8]=o*c,n[1]=o*h,n[5]=o*u,n[9]=-a,n[2]=f*a-g,n[6]=_+d*a,n[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,g=c*u,_=c*h;n[0]=d-_*a,n[4]=-o*h,n[8]=g+f*a,n[1]=f+g*a,n[5]=o*u,n[9]=_-d*a,n[2]=-o*c,n[6]=a,n[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,_=a*h;n[0]=l*u,n[4]=g*c-f,n[8]=d*c+_,n[1]=l*h,n[5]=_*c+d,n[9]=f*c-g,n[2]=-c,n[6]=a*l,n[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,g=a*l,_=a*c;n[0]=l*u,n[4]=_-d*h,n[8]=g*h+f,n[1]=h,n[5]=o*u,n[9]=-a*u,n[2]=-c*u,n[6]=f*h+g,n[10]=d-_*h}else if(e.order==="XZY"){let d=o*l,f=o*c,g=a*l,_=a*c;n[0]=l*u,n[4]=-h,n[8]=c*u,n[1]=d*h+_,n[5]=o*u,n[9]=f*h-g,n[2]=g*h-f,n[6]=a*u,n[10]=_*h+d}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(oS,e,aS)}lookAt(e,n,i){let r=this.elements;return Gn.subVectors(e,n),Gn.lengthSq()===0&&(Gn.z=1),Gn.normalize(),Br.crossVectors(i,Gn),Br.lengthSq()===0&&(Math.abs(i.z)===1?Gn.x+=1e-4:Gn.z+=1e-4,Gn.normalize(),Br.crossVectors(i,Gn)),Br.normalize(),yc.crossVectors(Gn,Br),r[0]=Br.x,r[4]=yc.x,r[8]=Gn.x,r[1]=Br.y,r[5]=yc.y,r[9]=Gn.y,r[2]=Br.z,r[6]=yc.z,r[10]=Gn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,r=n.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],f=i[13],g=i[2],_=i[6],m=i[10],p=i[14],E=i[3],T=i[7],v=i[11],C=i[15],A=r[0],b=r[4],P=r[8],S=r[12],y=r[1],L=r[5],F=r[9],B=r[13],G=r[2],$=r[6],z=r[10],J=r[14],V=r[3],re=r[7],te=r[11],we=r[15];return s[0]=o*A+a*y+l*G+c*V,s[4]=o*b+a*L+l*$+c*re,s[8]=o*P+a*F+l*z+c*te,s[12]=o*S+a*B+l*J+c*we,s[1]=u*A+h*y+d*G+f*V,s[5]=u*b+h*L+d*$+f*re,s[9]=u*P+h*F+d*z+f*te,s[13]=u*S+h*B+d*J+f*we,s[2]=g*A+_*y+m*G+p*V,s[6]=g*b+_*L+m*$+p*re,s[10]=g*P+_*F+m*z+p*te,s[14]=g*S+_*B+m*J+p*we,s[3]=E*A+T*y+v*G+C*V,s[7]=E*b+T*L+v*$+C*re,s[11]=E*P+T*F+v*z+C*te,s[15]=E*S+T*B+v*J+C*we,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+s*l*h-r*c*h-s*a*d+i*c*d+r*a*f-i*l*f)+_*(+n*l*f-n*c*d+s*o*d-r*o*f+r*c*u-s*l*u)+m*(+n*c*h-n*a*f-s*o*h+i*o*f+s*a*u-i*c*u)+p*(-r*a*u-n*l*h+n*a*d+r*o*h-i*o*d+i*l*u)}transpose(){let e=this.elements,n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){let e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],E=h*m*c-_*d*c+_*l*f-a*m*f-h*l*p+a*d*p,T=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,v=u*_*c-g*h*c+g*a*f-o*_*f-u*a*p+o*h*p,C=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,A=n*E+i*T+r*v+s*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let b=1/A;return e[0]=E*b,e[1]=(_*d*s-h*m*s-_*r*f+i*m*f+h*r*p-i*d*p)*b,e[2]=(a*m*s-_*l*s+_*r*c-i*m*c-a*r*p+i*l*p)*b,e[3]=(h*l*s-a*d*s-h*r*c+i*d*c+a*r*f-i*l*f)*b,e[4]=T*b,e[5]=(u*m*s-g*d*s+g*r*f-n*m*f-u*r*p+n*d*p)*b,e[6]=(g*l*s-o*m*s-g*r*c+n*m*c+o*r*p-n*l*p)*b,e[7]=(o*d*s-u*l*s+u*r*c-n*d*c-o*r*f+n*l*f)*b,e[8]=v*b,e[9]=(g*h*s-u*_*s-g*i*f+n*_*f+u*i*p-n*h*p)*b,e[10]=(o*_*s-g*a*s+g*i*c-n*_*c-o*i*p+n*a*p)*b,e[11]=(u*a*s-o*h*s-u*i*c+n*h*c+o*i*f-n*a*f)*b,e[12]=C*b,e[13]=(u*_*r-g*h*r+g*i*d-n*_*d-u*i*m+n*h*m)*b,e[14]=(g*a*r-o*_*r-g*i*l+n*_*l+o*i*m-n*a*m)*b,e[15]=(o*h*r-u*a*r+u*i*l-n*h*l-o*i*d+n*a*d)*b,this}scale(e){let n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){let n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){let i=Math.cos(n),r=Math.sin(n),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){let r=this.elements,s=n._x,o=n._y,a=n._z,l=n._w,c=s+s,u=o+o,h=a+a,d=s*c,f=s*u,g=s*h,_=o*u,m=o*h,p=a*h,E=l*c,T=l*u,v=l*h,C=i.x,A=i.y,b=i.z;return r[0]=(1-(_+p))*C,r[1]=(f+v)*C,r[2]=(g-T)*C,r[3]=0,r[4]=(f-v)*A,r[5]=(1-(d+p))*A,r[6]=(m+E)*A,r[7]=0,r[8]=(g+T)*b,r[9]=(m-E)*b,r[10]=(1-(d+_))*b,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){let r=this.elements,s=lo.set(r[0],r[1],r[2]).length(),o=lo.set(r[4],r[5],r[6]).length(),a=lo.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Mi.copy(this);let c=1/s,u=1/o,h=1/a;return Mi.elements[0]*=c,Mi.elements[1]*=c,Mi.elements[2]*=c,Mi.elements[4]*=u,Mi.elements[5]*=u,Mi.elements[6]*=u,Mi.elements[8]*=h,Mi.elements[9]*=h,Mi.elements[10]*=h,n.setFromRotationMatrix(Mi),i.x=s,i.y=o,i.z=a,this}makePerspective(e,n,i,r,s,o,a=Fi){let l=this.elements,c=2*s/(n-e),u=2*s/(i-r),h=(n+e)/(n-e),d=(i+r)/(i-r),f,g;if(a===Fi)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===qa)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,o,a=Fi){let l=this.elements,c=1/(n-e),u=1/(i-r),h=1/(o-s),d=(n+e)*c,f=(i+r)*u,g,_;if(a===Fi)g=(o+s)*h,_=-2*h;else if(a===qa)g=s*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}},lo=new w,Mi=new be,oS=new w(0,0,0),aS=new w(1,1,1),Br=new w,yc=new w,Gn=new w,M0=new be,E0=new he,ln=class t{constructor(e=0,n=0,i=0,r=t.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],f=r[10];switch(n){case"XYZ":this._y=Math.asin(Qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Qe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Qe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return M0.makeRotationFromQuaternion(e),this.setFromRotationMatrix(M0,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return E0.setFromEuler(this),this.setFromQuaternion(E0,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ln.DEFAULT_ORDER="XYZ";var $a=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},lS=0,S0=new w,co=new he,ar=new be,Mc=new w,Fa=new w,cS=new w,uS=new he,T0=new w(1,0,0),b0=new w(0,1,0),w0=new w(0,0,1),A0={type:"added"},hS={type:"removed"},uo={type:"childadded",child:null},$d={type:"childremoved",child:null},_t=class t extends dr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:lS++}),this.uuid=Ti(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=t.DEFAULT_UP.clone();let e=new w,n=new ln,i=new he,r=new w(1,1,1);function s(){i.setFromEuler(n,!1)}function o(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new be},normalMatrix:{value:new Ue}}),this.matrix=new be,this.matrixWorld=new be,this.matrixAutoUpdate=t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $a,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return co.setFromAxisAngle(e,n),this.quaternion.multiply(co),this}rotateOnWorldAxis(e,n){return co.setFromAxisAngle(e,n),this.quaternion.premultiply(co),this}rotateX(e){return this.rotateOnAxis(T0,e)}rotateY(e){return this.rotateOnAxis(b0,e)}rotateZ(e){return this.rotateOnAxis(w0,e)}translateOnAxis(e,n){return S0.copy(e).applyQuaternion(this.quaternion),this.position.add(S0.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(T0,e)}translateY(e){return this.translateOnAxis(b0,e)}translateZ(e){return this.translateOnAxis(w0,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ar.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?Mc.copy(e):Mc.set(e,n,i);let r=this.parent;this.updateWorldMatrix(!0,!1),Fa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ar.lookAt(Fa,Mc,this.up):ar.lookAt(Mc,Fa,this.up),this.quaternion.setFromRotationMatrix(ar),r&&(ar.extractRotation(r.matrixWorld),co.setFromRotationMatrix(ar),this.quaternion.premultiply(co.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(A0),uo.child=e,this.dispatchEvent(uo),uo.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(hS),$d.child=e,this.dispatchEvent($d),$d.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ar.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ar.multiply(e.parent.matrixWorld)),e.applyMatrix4(ar),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(A0),uo.child=e,this.dispatchEvent(uo),uo.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,n);if(o!==void 0)return o}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fa,e,cS),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fa,uS,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){let n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(n){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};_t.DEFAULT_UP=new w(0,1,0);_t.DEFAULT_MATRIX_AUTO_UPDATE=!0;_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ei=new w,lr=new w,jd=new w,cr=new w,ho=new w,fo=new w,R0=new w,Zd=new w,Kd=new w,Jd=new w,Qd=new ut,ef=new ut,tf=new ut,Vr=class t{constructor(e=new w,n=new w,i=new w){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),Ei.subVectors(e,n),r.cross(Ei);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){Ei.subVectors(r,n),lr.subVectors(i,n),jd.subVectors(e,n);let o=Ei.dot(Ei),a=Ei.dot(lr),l=Ei.dot(jd),c=lr.dot(lr),u=lr.dot(jd),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return s.set(1-f-g,g,f)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,cr)===null?!1:cr.x>=0&&cr.y>=0&&cr.x+cr.y<=1}static getInterpolation(e,n,i,r,s,o,a,l){return this.getBarycoord(e,n,i,r,cr)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,cr.x),l.addScaledVector(o,cr.y),l.addScaledVector(a,cr.z),l)}static getInterpolatedAttribute(e,n,i,r,s,o){return Qd.setScalar(0),ef.setScalar(0),tf.setScalar(0),Qd.fromBufferAttribute(e,n),ef.fromBufferAttribute(e,i),tf.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Qd,s.x),o.addScaledVector(ef,s.y),o.addScaledVector(tf,s.z),o}static isFrontFacing(e,n,i,r){return Ei.subVectors(i,n),lr.subVectors(e,n),Ei.cross(lr).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ei.subVectors(this.c,this.b),lr.subVectors(this.a,this.b),Ei.cross(lr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return t.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return t.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return t.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return t.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return t.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){let i=this.a,r=this.b,s=this.c,o,a;ho.subVectors(r,i),fo.subVectors(s,i),Zd.subVectors(e,i);let l=ho.dot(Zd),c=fo.dot(Zd);if(l<=0&&c<=0)return n.copy(i);Kd.subVectors(e,r);let u=ho.dot(Kd),h=fo.dot(Kd);if(u>=0&&h<=u)return n.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),n.copy(i).addScaledVector(ho,o);Jd.subVectors(e,s);let f=ho.dot(Jd),g=fo.dot(Jd);if(g>=0&&f<=g)return n.copy(s);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),n.copy(i).addScaledVector(fo,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return R0.subVectors(s,r),a=(h-u)/(h-u+(f-g)),n.copy(r).addScaledVector(R0,a);let p=1/(m+_+d);return o=_*p,a=d*p,n.copy(i).addScaledVector(ho,o).addScaledVector(fo,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},W_={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kr={h:0,s:0,l:0},Ec={h:0,s:0,l:0};function nf(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}var xe=class{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,n),this}setRGB(e,n,i,r=nt.workingColorSpace){return this.r=e,this.g=n,this.b=i,nt.colorSpaceToWorking(this,r),this}setHSL(e,n,i,r=nt.workingColorSpace){if(e=zf(e,1),n=Qe(n,0,1),i=Qe(i,0,1),n===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+n):i+n-i*n,o=2*i-s;this.r=nf(o,s,e+1/3),this.g=nf(o,s,e),this.b=nf(o,s,e-1/3)}return nt.colorSpaceToWorking(this,r),this}setStyle(e,n=Qt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=Qt){let i=W_[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=hr(e.r),this.g=hr(e.g),this.b=hr(e.b),this}copyLinearToSRGB(e){return this.r=xo(e.r),this.g=xo(e.g),this.b=xo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Qt){return nt.workingToColorSpace(pn.copy(this),e),Math.round(Qe(pn.r*255,0,255))*65536+Math.round(Qe(pn.g*255,0,255))*256+Math.round(Qe(pn.b*255,0,255))}getHexString(e=Qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=nt.workingColorSpace){nt.workingToColorSpace(pn.copy(this),n);let i=pn.r,r=pn.g,s=pn.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,n=nt.workingColorSpace){return nt.workingToColorSpace(pn.copy(this),n),e.r=pn.r,e.g=pn.g,e.b=pn.b,e}getStyle(e=Qt){nt.workingToColorSpace(pn.copy(this),e);let n=pn.r,i=pn.g,r=pn.b;return e!==Qt?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(kr),this.setHSL(kr.h+e,kr.s+n,kr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(kr),e.getHSL(Ec);let i=Wa(kr.h,Ec.h,n),r=Wa(kr.s,Ec.s,n),s=Wa(kr.l,Ec.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},pn=new xe;xe.NAMES=W_;var dS=0,mn=class extends dr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dS++}),this.uuid=Ti(),this.name="",this.type="Material",this.blending=ys,this.side=bi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Hc,this.blendDst=Vc,this.blendEquation=zr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new xe(0,0,0),this.blendAlpha=0,this.depthFunc=Ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_f,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=xs,this.stencilZFail=xs,this.stencilZPass=xs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let n in e){let i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}let r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){let n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ys&&(i.blending=this.blending),this.side!==bi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Hc&&(i.blendSrc=this.blendSrc),this.blendDst!==Vc&&(i.blendDst=this.blendDst),this.blendEquation!==zr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ms&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_f&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==xs&&(i.stencilFail=this.stencilFail),this.stencilZFail!==xs&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==xs&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(n){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let n=e.clippingPlanes,i=null;if(n!==null){let r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Ln=class extends mn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.combine=Cf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Yt=new w,Sc=new Ye,fS=0,Ge=class{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fS++}),this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=zc,this.updateRanges=[],this.gpuType=oi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Sc.fromBufferAttribute(this,n),Sc.applyMatrix3(e),this.setXY(n,Sc.x,Sc.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)Yt.fromBufferAttribute(this,n),Yt.applyMatrix3(e),this.setXYZ(n,Yt.x,Yt.y,Yt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)Yt.fromBufferAttribute(this,n),Yt.applyMatrix4(e),this.setXYZ(n,Yt.x,Yt.y,Yt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)Yt.fromBufferAttribute(this,n),Yt.applyNormalMatrix(e),this.setXYZ(n,Yt.x,Yt.y,Yt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)Yt.fromBufferAttribute(this,n),Yt.transformDirection(e),this.setXYZ(n,Yt.x,Yt.y,Yt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Si(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=yt(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Si(n,this.array)),n}setX(e,n){return this.normalized&&(n=yt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Si(n,this.array)),n}setY(e,n){return this.normalized&&(n=yt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Si(n,this.array)),n}setZ(e,n){return this.normalized&&(n=yt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Si(n,this.array)),n}setW(e,n){return this.normalized&&(n=yt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=yt(n,this.array),i=yt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=yt(n,this.array),i=yt(i,this.array),r=yt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=yt(n,this.array),i=yt(i,this.array),r=yt(r,this.array),s=yt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==zc&&(e.usage=this.usage),e}};var ja=class extends Ge{constructor(e,n,i){super(new Uint16Array(e),n,i)}};var Za=class extends Ge{constructor(e,n,i){super(new Uint32Array(e),n,i)}};var yn=class extends Ge{constructor(e,n,i){super(new Float32Array(e),n,i)}},pS=0,ri=new be,rf=new _t,po=new w,Wn=new Xn,Ba=new Xn,on=new w,ht=class t extends dr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:pS++}),this.uuid=Ti(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Gf(e)?Za:ja)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Ue().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ri.makeRotationFromQuaternion(e),this.applyMatrix4(ri),this}rotateX(e){return ri.makeRotationX(e),this.applyMatrix4(ri),this}rotateY(e){return ri.makeRotationY(e),this.applyMatrix4(ri),this}rotateZ(e){return ri.makeRotationZ(e),this.applyMatrix4(ri),this}translate(e,n,i){return ri.makeTranslation(e,n,i),this.applyMatrix4(ri),this}scale(e,n,i){return ri.makeScale(e,n,i),this.applyMatrix4(ri),this}lookAt(e){return rf.lookAt(e),rf.updateMatrix(),this.applyMatrix4(rf.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(po).negate(),this.translate(po.x,po.y,po.z),this}setFromPoints(e){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new yn(i,3))}else{let i=Math.min(e.length,n.count);for(let r=0;r<i;r++){let s=e[r];n.setXYZ(r,s.x,s.y,s.z||0)}e.length>n.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Xn);let e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){let s=n[i];Wn.setFromBufferAttribute(s),this.morphTargetsRelative?(on.addVectors(this.boundingBox.min,Wn.min),this.boundingBox.expandByPoint(on),on.addVectors(this.boundingBox.max,Wn.max),this.boundingBox.expandByPoint(on)):(this.boundingBox.expandByPoint(Wn.min),this.boundingBox.expandByPoint(Wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Pn);let e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(e){let i=this.boundingSphere.center;if(Wn.setFromBufferAttribute(e),n)for(let s=0,o=n.length;s<o;s++){let a=n[s];Ba.setFromBufferAttribute(a),this.morphTargetsRelative?(on.addVectors(Wn.min,Ba.min),Wn.expandByPoint(on),on.addVectors(Wn.max,Ba.max),Wn.expandByPoint(on)):(Wn.expandByPoint(Ba.min),Wn.expandByPoint(Ba.max))}Wn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)on.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(on));if(n)for(let s=0,o=n.length;s<o;s++){let a=n[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)on.fromBufferAttribute(a,c),l&&(po.fromBufferAttribute(e,c),on.add(po)),r=Math.max(r,i.distanceToSquared(on))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ge(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<i.count;P++)a[P]=new w,l[P]=new w;let c=new w,u=new w,h=new w,d=new Ye,f=new Ye,g=new Ye,_=new w,m=new w;function p(P,S,y){c.fromBufferAttribute(i,P),u.fromBufferAttribute(i,S),h.fromBufferAttribute(i,y),d.fromBufferAttribute(s,P),f.fromBufferAttribute(s,S),g.fromBufferAttribute(s,y),u.sub(c),h.sub(c),f.sub(d),g.sub(d);let L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(L),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(L),a[P].add(_),a[S].add(_),a[y].add(_),l[P].add(m),l[S].add(m),l[y].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let P=0,S=E.length;P<S;++P){let y=E[P],L=y.start,F=y.count;for(let B=L,G=L+F;B<G;B+=3)p(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let T=new w,v=new w,C=new w,A=new w;function b(P){C.fromBufferAttribute(r,P),A.copy(C);let S=a[P];T.copy(S),T.sub(C.multiplyScalar(C.dot(S))).normalize(),v.crossVectors(A,S);let L=v.dot(l[P])<0?-1:1;o.setXYZW(P,T.x,T.y,T.z,L)}for(let P=0,S=E.length;P<S;++P){let y=E[P],L=y.start,F=y.count;for(let B=L,G=L+F;B<G;B+=3)b(e.getX(B+0)),b(e.getX(B+1)),b(e.getX(B+2))}}computeVertexNormals(){let e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Ge(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let r=new w,s=new w,o=new w,a=new w,l=new w,c=new w,u=new w,h=new w;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(n,g),s.fromBufferAttribute(n,_),o.fromBufferAttribute(n,m),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(u),l.add(u),c.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=n.count;d<f;d+=3)r.fromBufferAttribute(n,d+0),s.fromBufferAttribute(n,d+1),o.fromBufferAttribute(n,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)on.fromBufferAttribute(e,n),on.normalize(),e.setXYZ(n,on.x,on.y,on.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new Ge(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new t,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);n.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,i);l.push(f)}n.morphAttributes[a]=l}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(n))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(n));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},C0=new be,_s=new ws,Tc=new Pn,I0=new w,bc=new w,wc=new w,Ac=new w,sf=new w,Rc=new w,P0=new w,Cc=new w,jt=class extends _t{constructor(e=new ht,n=new Ln){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,n){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Rc.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(sf.fromBufferAttribute(h,e),o?Rc.addScaledVector(sf,u):Rc.addScaledVector(sf.sub(n),u))}n.add(Rc)}return n}raycast(e,n){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Tc.copy(i.boundingSphere),Tc.applyMatrix4(s),_s.copy(e.ray).recast(e.near),!(Tc.containsPoint(_s.origin)===!1&&(_s.intersectSphere(Tc,I0)===null||_s.origin.distanceToSquared(I0)>(e.far-e.near)**2))&&(C0.copy(s).invert(),_s.copy(e.ray).applyMatrix4(C0),!(i.boundingBox!==null&&_s.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,_s)))}_computeIntersections(e,n,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),T=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=E,C=T;v<C;v+=3){let A=a.getX(v),b=a.getX(v+1),P=a.getX(v+2);r=Ic(this,p,e,i,c,u,h,A,b,P),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let E=a.getX(m),T=a.getX(m+1),v=a.getX(m+2);r=Ic(this,o,e,i,c,u,h,E,T,v),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),T=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=E,C=T;v<C;v+=3){let A=v,b=v+1,P=v+2;r=Ic(this,p,e,i,c,u,h,A,b,P),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let E=m,T=m+1,v=m+2;r=Ic(this,o,e,i,c,u,h,E,T,v),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}};function mS(t,e,n,i,r,s,o,a){let l;if(e.side===dn?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===bi,a),l===null)return null;Cc.copy(a),Cc.applyMatrix4(t.matrixWorld);let c=n.ray.origin.distanceTo(Cc);return c<n.near||c>n.far?null:{distance:c,point:Cc.clone(),object:t}}function Ic(t,e,n,i,r,s,o,a,l,c){t.getVertexPosition(a,bc),t.getVertexPosition(l,wc),t.getVertexPosition(c,Ac);let u=mS(t,e,n,i,bc,wc,Ac,P0);if(u){let h=new w;Vr.getBarycoord(P0,bc,wc,Ac,h),r&&(u.uv=Vr.getInterpolatedAttribute(r,a,l,c,h,new Ye)),s&&(u.uv1=Vr.getInterpolatedAttribute(s,a,l,c,h,new Ye)),o&&(u.normal=Vr.getInterpolatedAttribute(o,a,l,c,h,new w),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new w,materialIndex:0};Vr.getNormal(bc,wc,Ac,d.normal),u.face=d,u.barycoord=h}return u}var To=class t extends ht{constructor(e=1,n=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,i,n,e,o,s,0),g("z","y","x",1,-1,i,n,-e,o,s,1),g("x","z","y",1,1,e,i,n,r,o,2),g("x","z","y",1,-1,e,i,-n,r,o,3),g("x","y","z",1,-1,e,n,i,r,s,4),g("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new yn(c,3)),this.setAttribute("normal",new yn(u,3)),this.setAttribute("uv",new yn(h,2));function g(_,m,p,E,T,v,C,A,b,P,S){let y=v/b,L=C/P,F=v/2,B=C/2,G=A/2,$=b+1,z=P+1,J=0,V=0,re=new w;for(let te=0;te<z;te++){let we=te*L-B;for(let qe=0;qe<$;qe++){let ot=qe*y-F;re[_]=ot*E,re[m]=we*T,re[p]=G,c.push(re.x,re.y,re.z),re[_]=0,re[m]=0,re[p]=A>0?1:-1,u.push(re.x,re.y,re.z),h.push(qe/b),h.push(1-te/P),J+=1}}for(let te=0;te<P;te++)for(let we=0;we<b;we++){let qe=d+we+$*te,ot=d+we+$*(te+1),q=d+(we+1)+$*(te+1),ne=d+(we+1)+$*te;l.push(qe,ot,ne),l.push(ot,q,ne),V+=6}a.addGroup(f,V,S),f+=V,d+=J}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ds(t){let e={};for(let n in t){e[n]={};for(let i in t[n]){let r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function gn(t){let e={};for(let n=0;n<t.length;n++){let i=Ds(t[n]);for(let r in i)e[r]=i[r]}return e}function gS(t){let e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function Wf(t){let e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}var Yu={clone:Ds,merge:gn},_S=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,vS=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,qn=class extends mn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_S,this.fragmentShader=vS,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ds(e.uniforms),this.uniformsGroups=gS(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?n.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?n.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[r]={type:"m4",value:o.toArray()}:n.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}},Ka=class extends _t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new be,this.projectionMatrix=new be,this.projectionMatrixInverse=new be,this.coordinateSystem=Fi}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Hr=new w,L0=new Ye,U0=new Ye,$t=class extends Ka{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let n=.5*this.getFilmHeight()/e;this.fov=Ts*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ga*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ts*2*Math.atan(Math.tan(Ga*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){Hr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Hr.x,Hr.y).multiplyScalar(-e/Hr.z),Hr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Hr.x,Hr.y).multiplyScalar(-e/Hr.z)}getViewSize(e,n){return this.getViewBounds(e,L0,U0),n.subVectors(U0,L0)}setViewOffset(e,n,i,r,s,o){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,n=e*Math.tan(Ga*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,n-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}},mo=-90,go=1,qc=class extends _t{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new $t(mo,go,e,n);r.layers=this.layers,this.add(r);let s=new $t(mo,go,e,n);s.layers=this.layers,this.add(s);let o=new $t(mo,go,e,n);o.layers=this.layers,this.add(o);let a=new $t(mo,go,e,n);a.layers=this.layers,this.add(a);let l=new $t(mo,go,e,n);l.layers=this.layers,this.add(l);let c=new $t(mo,go,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,n=this.children.concat(),[i,r,s,o,a,l]=n;for(let c of n)this.remove(c);if(e===Fi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===qa)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,o),e.setRenderTarget(i,2,r),e.render(n,a),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,r),e.render(n,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Ja=class extends an{constructor(e=[],n=Ls,i,r,s,o,a,l,c,u){super(e,n,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Yc=class extends ki{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Ja(r),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new To(5,5,5),s=new qn({name:"CubemapFromEquirect",uniforms:Ds(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:dn,blending:vr});s.uniforms.tEquirect.value=n;let o=new jt(r,s),a=n.minFilter;return n.minFilter===Ri&&(n.minFilter=Mn),new qc(1,10,this).update(e,o),n.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,n=!0,i=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(n,i,r);e.setRenderTarget(s)}},kt=class extends _t{constructor(){super(),this.isGroup=!0,this.type="Group"}},xS={type:"move"},bo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new kt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new kt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new kt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let n=this._hand;if(n)for(let i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=n.getJointPose(_,i),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(xS)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){let i=new kt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}};var Qa=class extends _t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ln,this.environmentIntensity=1,this.environmentRotation=new ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}},wo=class{constructor(e,n){this.isInterleavedBuffer=!0,this.array=e,this.stride=n,this.count=e!==void 0?e.length/n:0,this.usage=zc,this.updateRanges=[],this.version=0,this.uuid=Ti()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,n,i){e*=this.stride,i*=n.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=n.array[i+r];return this}set(e,n=0){return this.array.set(e,n),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ti()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ti()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},xn=new w,Ao=class t{constructor(e,n,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=n,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let n=0,i=this.data.count;n<i;n++)xn.fromBufferAttribute(this,n),xn.applyMatrix4(e),this.setXYZ(n,xn.x,xn.y,xn.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)xn.fromBufferAttribute(this,n),xn.applyNormalMatrix(e),this.setXYZ(n,xn.x,xn.y,xn.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)xn.fromBufferAttribute(this,n),xn.transformDirection(e),this.setXYZ(n,xn.x,xn.y,xn.z);return this}getComponent(e,n){let i=this.array[e*this.data.stride+this.offset+n];return this.normalized&&(i=Si(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=yt(i,this.array)),this.data.array[e*this.data.stride+this.offset+n]=i,this}setX(e,n){return this.normalized&&(n=yt(n,this.array)),this.data.array[e*this.data.stride+this.offset]=n,this}setY(e,n){return this.normalized&&(n=yt(n,this.array)),this.data.array[e*this.data.stride+this.offset+1]=n,this}setZ(e,n){return this.normalized&&(n=yt(n,this.array)),this.data.array[e*this.data.stride+this.offset+2]=n,this}setW(e,n){return this.normalized&&(n=yt(n,this.array)),this.data.array[e*this.data.stride+this.offset+3]=n,this}getX(e){let n=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(n=Si(n,this.array)),n}getY(e){let n=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(n=Si(n,this.array)),n}getZ(e){let n=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(n=Si(n,this.array)),n}getW(e){let n=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(n=Si(n,this.array)),n}setXY(e,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(n=yt(n,this.array),i=yt(i,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this}setXYZ(e,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(n=yt(n,this.array),i=yt(i,this.array),r=yt(r,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(n=yt(n,this.array),i=yt(i,this.array),r=yt(r,this.array),s=yt(s,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)n.push(this.data.array[r+s])}return new Ge(new this.array.constructor(n),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new t(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)n.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}};var N0=new w,D0=new ut,O0=new ut,yS=new w,F0=new be,Pc=new w,of=new Pn,B0=new be,af=new ws,As=class extends jt{constructor(e,n){super(e,n),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ff,this.bindMatrix=new be,this.bindMatrixInverse=new be,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Xn),this.boundingBox.makeEmpty();let n=e.getAttribute("position");for(let i=0;i<n.count;i++)this.getVertexPosition(i,Pc),this.boundingBox.expandByPoint(Pc)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Pn),this.boundingSphere.makeEmpty();let n=e.getAttribute("position");for(let i=0;i<n.count;i++)this.getVertexPosition(i,Pc),this.boundingSphere.expandByPoint(Pc)}copy(e,n){return super.copy(e,n),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,n){let i=this.material,r=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),of.copy(this.boundingSphere),of.applyMatrix4(r),e.ray.intersectsSphere(of)!==!1&&(B0.copy(r).invert(),af.copy(e.ray).applyMatrix4(B0),!(this.boundingBox!==null&&af.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,n,af)))}getVertexPosition(e,n){return super.getVertexPosition(e,n),this.applyBoneTransform(e,n),n}bind(e,n){this.skeleton=e,n===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),n=this.matrixWorld),this.bindMatrix.copy(n),this.bindMatrixInverse.copy(n).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new ut,n=this.geometry.attributes.skinWeight;for(let i=0,r=n.count;i<r;i++){e.fromBufferAttribute(n,i);let s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),n.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ff?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===R_?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,n){let i=this.skeleton,r=this.geometry;D0.fromBufferAttribute(r.attributes.skinIndex,e),O0.fromBufferAttribute(r.attributes.skinWeight,e),N0.copy(n).applyMatrix4(this.bindMatrix),n.set(0,0,0);for(let s=0;s<4;s++){let o=O0.getComponent(s);if(o!==0){let a=D0.getComponent(s);F0.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),n.addScaledVector(yS.copy(N0).applyMatrix4(F0),o)}}return n.applyMatrix4(this.bindMatrixInverse)}},Ro=class extends _t{constructor(){super(),this.isBone=!0,this.type="Bone"}},el=class extends an{constructor(e=null,n=1,i=1,r,s,o,a,l,c=un,u=un,h,d){super(null,o,a,l,c,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},k0=new be,MS=new be,wi=class t{constructor(e=[],n=[]){this.uuid=Ti(),this.bones=e.slice(0),this.boneInverses=n,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,n=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),n.length===0)this.calculateInverses();else if(e.length!==n.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,r=this.bones.length;i<r;i++)this.boneInverses.push(new be)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,n=this.bones.length;e<n;e++){let i=new be;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,n=this.bones.length;e<n;e++){let i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,n=this.bones.length;e<n;e++){let i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let e=this.bones,n=this.boneInverses,i=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){let a=e[s]?e[s].matrixWorld:MS;k0.multiplyMatrices(a,n[s]),k0.toArray(i,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new t(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let n=new Float32Array(e*e*4);n.set(this.boneMatrices);let i=new el(n,e,e,Yn,oi);return i.needsUpdate=!0,this.boneMatrices=n,this.boneTexture=i,this}getBoneByName(e){for(let n=0,i=this.bones.length;n<i;n++){let r=this.bones[n];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,n){this.uuid=e.uuid;for(let i=0,r=e.bones.length;i<r;i++){let s=e.bones[i],o=n[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new Ro),this.bones.push(o),this.boneInverses.push(new be().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let n=this.bones,i=this.boneInverses;for(let r=0,s=n.length;r<s;r++){let o=n[r];e.bones.push(o.uuid);let a=i[r];e.boneInverses.push(a.toArray())}return e}},Wr=class extends Ge{constructor(e,n,i,r=1){super(e,n,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},_o=new be,H0=new be,Lc=[],V0=new Xn,ES=new be,ka=new jt,Ha=new Pn,tl=class extends jt{constructor(e,n,i){super(e,n),this.isInstancedMesh=!0,this.instanceMatrix=new Wr(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,ES)}computeBoundingBox(){let e=this.geometry,n=this.count;this.boundingBox===null&&(this.boundingBox=new Xn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,_o),V0.copy(e.boundingBox).applyMatrix4(_o),this.boundingBox.union(V0)}computeBoundingSphere(){let e=this.geometry,n=this.count;this.boundingSphere===null&&(this.boundingSphere=new Pn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,_o),Ha.copy(e.boundingSphere).applyMatrix4(_o),this.boundingSphere.union(Ha)}copy(e,n){return super.copy(e,n),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,n){n.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,n){n.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,n){let i=n.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,n){let i=this.matrixWorld,r=this.count;if(ka.geometry=this.geometry,ka.material=this.material,ka.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ha.copy(this.boundingSphere),Ha.applyMatrix4(i),e.ray.intersectsSphere(Ha)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,_o),H0.multiplyMatrices(i,_o),ka.matrixWorld=H0,ka.raycast(e,Lc);for(let o=0,a=Lc.length;o<a;o++){let l=Lc[o];l.instanceId=s,l.object=this,n.push(l)}Lc.length=0}}setColorAt(e,n){this.instanceColor===null&&(this.instanceColor=new Wr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),n.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,n){n.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,n){let i=n.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new el(new Float32Array(r*this.count),r,this.count,_u,oi));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(i,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},lf=new w,SS=new w,TS=new Ue,Di=class{constructor(e=new w(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){let r=lf.subVectors(i,n).cross(SS.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){let i=e.delta(lf),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){let i=n||TS.getNormalMatrix(e),r=this.coplanarPoint(lf).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},vs=new Pn,bS=new Ye(.5,.5),Uc=new w,Co=class{constructor(e=new Di,n=new Di,i=new Di,r=new Di,s=new Di,o=new Di){this.planes=[e,n,i,r,s,o]}set(e,n,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(n),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=Fi){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],f=r[8],g=r[9],_=r[10],m=r[11],p=r[12],E=r[13],T=r[14],v=r[15];if(i[0].setComponents(l-s,d-c,m-f,v-p).normalize(),i[1].setComponents(l+s,d+c,m+f,v+p).normalize(),i[2].setComponents(l+o,d+u,m+g,v+E).normalize(),i[3].setComponents(l-o,d-u,m-g,v-E).normalize(),i[4].setComponents(l-a,d-h,m-_,v-T).normalize(),n===Fi)i[5].setComponents(l+a,d+h,m+_,v+T).normalize();else if(n===qa)i[5].setComponents(a,h,_,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),vs.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vs)}intersectsSprite(e){vs.center.set(0,0,0);let n=bS.distanceTo(e.center);return vs.radius=.7071067811865476+n,vs.applyMatrix4(e.matrixWorld),this.intersectsSphere(vs)}intersectsSphere(e){let n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let n=this.planes;for(let i=0;i<6;i++){let r=n[i];if(Uc.x=r.normal.x>0?e.max.x:e.min.x,Uc.y=r.normal.y>0?e.max.y:e.min.y,Uc.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Uc)<0)return!1}return!0}containsPoint(e){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var En=class extends mn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new xe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},$c=new w,jc=new w,z0=new be,Va=new ws,Nc=new Pn,cf=new w,G0=new w,fr=class extends _t{constructor(e=new ht,n=new En){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let n=e.attributes.position,i=[0];for(let r=1,s=n.count;r<s;r++)$c.fromBufferAttribute(n,r-1),jc.fromBufferAttribute(n,r),i[r]=i[r-1],i[r]+=$c.distanceTo(jc);e.setAttribute("lineDistance",new yn(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,n){let i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Nc.copy(i.boundingSphere),Nc.applyMatrix4(r),Nc.radius+=s,e.ray.intersectsSphere(Nc)===!1)return;z0.copy(r).invert(),Va.copy(e.ray).applyMatrix4(z0);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=i.index,d=i.attributes.position;if(u!==null){let f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){let p=u.getX(_),E=u.getX(_+1),T=Dc(this,e,Va,l,p,E,_);T&&n.push(T)}if(this.isLineLoop){let _=u.getX(g-1),m=u.getX(f),p=Dc(this,e,Va,l,_,m,g-1);p&&n.push(p)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){let p=Dc(this,e,Va,l,_,_+1,_);p&&n.push(p)}if(this.isLineLoop){let _=Dc(this,e,Va,l,g-1,f,g-1);_&&n.push(_)}}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function Dc(t,e,n,i,r,s,o){let a=t.geometry.attributes.position;if($c.fromBufferAttribute(a,r),jc.fromBufferAttribute(a,s),n.distanceSqToSegment($c,jc,cf,G0)>i)return;cf.applyMatrix4(t.matrixWorld);let c=e.ray.origin.distanceTo(cf);if(!(c<e.near||c>e.far))return{distance:c,point:G0.clone().applyMatrix4(t.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:t}}var W0=new w,X0=new w,si=class extends fr{constructor(e,n){super(e,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let n=e.attributes.position,i=[];for(let r=0,s=n.count;r<s;r+=2)W0.fromBufferAttribute(n,r),X0.fromBufferAttribute(n,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+W0.distanceTo(X0);e.setAttribute("lineDistance",new yn(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},nl=class extends fr{constructor(e,n){super(e,n),this.isLineLoop=!0,this.type="LineLoop"}},Io=class extends mn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new xe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},q0=new be,vf=new ws,Oc=new Pn,Fc=new w,il=class extends _t{constructor(e=new ht,n=new Io){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){let i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Oc.copy(i.boundingSphere),Oc.applyMatrix4(r),Oc.radius+=s,e.ray.intersectsSphere(Oc)===!1)return;q0.copy(r).invert(),vf.copy(e.ray).applyMatrix4(q0);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,h=i.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,_=f;g<_;g++){let m=c.getX(g);Fc.fromBufferAttribute(h,m),Y0(Fc,m,l,r,e,n,this)}}else{let d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let g=d,_=f;g<_;g++)Fc.fromBufferAttribute(h,g),Y0(Fc,g,l,r,e,n,this)}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function Y0(t,e,n,i,r,s,o){let a=vf.distanceSqToPoint(t);if(a<n){let l=new w;vf.closestPointToPoint(t,l),l.applyMatrix4(i);let c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var rl=class extends an{constructor(e,n,i=Xr,r,s,o,a=un,l=un,c,u=Mo,h=1){if(u!==Mo&&u!==Bo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:n,depth:h};super(d,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new So(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}};var sl=class t extends ht{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};let s=e/2,o=n/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=n/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){let E=p*d-o;for(let T=0;T<c;T++){let v=T*h-s;g.push(v,-E,0),_.push(0,0,1),m.push(T/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let E=0;E<a;E++){let T=E+c*p,v=E+c*(p+1),C=E+1+c*(p+1),A=E+1+c*p;f.push(T,v,A),f.push(v,C,A)}this.setIndex(f),this.setAttribute("position",new yn(g,3)),this.setAttribute("normal",new yn(_,3)),this.setAttribute("uv",new yn(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new t(e.width,e.height,e.widthSegments,e.heightSegments)}};var Rs=class extends mn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=El,this.normalScale=new Ye(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Un=class extends Rs{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ye(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Qe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(n){this.ior=(1+.4*n)/(1-.4*n)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new xe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new xe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new xe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Zc=class extends mn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=I_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Kc=class extends mn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Bc(t,e){return!t||t.constructor===e?t:typeof e.BYTES_PER_ELEMENT=="number"?new e(t):Array.prototype.slice.call(t)}function wS(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function AS(t){function e(r,s){return t[r]-t[s]}let n=t.length,i=new Array(n);for(let r=0;r!==n;++r)i[r]=r;return i.sort(e),i}function $0(t,e,n){let i=t.length,r=new t.constructor(i);for(let s=0,o=0;o!==i;++s){let a=n[s]*e;for(let l=0;l!==e;++l)r[o++]=t[a+l]}return r}function X_(t,e,n,i){let r=1,s=t[0];for(;s!==void 0&&s[i]===void 0;)s=t[r++];if(s===void 0)return;let o=s[i];if(o!==void 0)if(Array.isArray(o))do o=s[i],o!==void 0&&(e.push(s.time),n.push(...o)),s=t[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[i],o!==void 0&&(e.push(s.time),o.toArray(n,n.length)),s=t[r++];while(s!==void 0);else do o=s[i],o!==void 0&&(e.push(s.time),n.push(o)),s=t[r++];while(s!==void 0)}var pr=class{constructor(e,n,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let n=this.parameterPositions,i=this._cachedIndex,r=n[i],s=n[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=n[++i],e<r)break t}o=n.length;break n}if(!(e>=s)){let a=n[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=n[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<n[a]?o=a:i=a+1}if(r=n[i],s=n[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let n=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)n[o]=i[s+o];return n}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Jc=class extends pr{constructor(e,n,i,r){super(e,n,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:pf,endingEnd:pf}}intervalChanged_(e,n,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case mf:s=e,a=2*n-i;break;case gf:s=r.length-2,a=n+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case mf:o=e,l=2*i-n;break;case gf:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=n}let c=(i-n)*.5,u=this.valueSize;this._weightPrev=c/(n-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-n)/(r-n),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,E=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,T=(-1-f)*m+(1.5+f)*_+.5*g,v=f*m-f*_;for(let C=0;C!==a;++C)s[C]=p*o[u+C]+E*o[c+C]+T*o[l+C]+v*o[h+C];return s}},Qc=class extends pr{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-n)/(r-n),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},eu=class extends pr{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Nn=class{constructor(e,n,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Bc(n,this.TimeBufferType),this.values=Bc(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let n=e.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(e);else{i={name:e.name,times:Bc(e.times,Array),values:Bc(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new eu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Qc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Jc(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let n;switch(e){case Es:n=this.InterpolantFactoryMethodDiscrete;break;case Ss:n=this.InterpolantFactoryMethodLinear;break;case kc:n=this.InterpolantFactoryMethodSmooth;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Es;case this.InterpolantFactoryMethodLinear:return Ss;case this.InterpolantFactoryMethodSmooth:return kc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let n=this.times;for(let i=0,r=n.length;i!==r;++i)n[i]+=e}return this}scale(e){if(e!==1){let n=this.times;for(let i=0,r=n.length;i!==r;++i)n[i]*=e}return this}trim(e,n){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>n;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&wS(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===kc,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,d=h-i,f=h+i;for(let g=0;g!==i;++g){let _=n[h+g];if(_!==n[d+g]||_!==n[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let f=0;f!==i;++f)n[d+f]=n[h+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)n[l+c]=n[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=n.slice(0,o*i)):(this.times=e,this.values=n),this}clone(){let e=this.times.slice(),n=this.values.slice(),i=this.constructor,r=new i(this.name,e,n);return r.createInterpolant=this.createInterpolant,r}};Nn.prototype.ValueTypeName="";Nn.prototype.TimeBufferType=Float32Array;Nn.prototype.ValueBufferType=Float32Array;Nn.prototype.DefaultInterpolation=Ss;var mr=class extends Nn{constructor(e,n,i){super(e,n,i)}};mr.prototype.ValueTypeName="bool";mr.prototype.ValueBufferType=Array;mr.prototype.DefaultInterpolation=Es;mr.prototype.InterpolantFactoryMethodLinear=void 0;mr.prototype.InterpolantFactoryMethodSmooth=void 0;var ol=class extends Nn{constructor(e,n,i,r){super(e,n,i,r)}};ol.prototype.ValueTypeName="color";var Hi=class extends Nn{constructor(e,n,i,r){super(e,n,i,r)}};Hi.prototype.ValueTypeName="number";var tu=class extends pr{constructor(e,n,i,r){super(e,n,i,r)}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-n)/(r-n),c=e*a;for(let u=c+a;c!==u;c+=4)he.slerpFlat(s,0,o,c-a,o,c,l);return s}},Vi=class extends Nn{constructor(e,n,i,r){super(e,n,i,r)}InterpolantFactoryMethodLinear(e){return new tu(this.times,this.values,this.getValueSize(),e)}};Vi.prototype.ValueTypeName="quaternion";Vi.prototype.InterpolantFactoryMethodSmooth=void 0;var gr=class extends Nn{constructor(e,n,i){super(e,n,i)}};gr.prototype.ValueTypeName="string";gr.prototype.ValueBufferType=Array;gr.prototype.DefaultInterpolation=Es;gr.prototype.InterpolantFactoryMethodLinear=void 0;gr.prototype.InterpolantFactoryMethodSmooth=void 0;var zi=class extends Nn{constructor(e,n,i,r){super(e,n,i,r)}};zi.prototype.ValueTypeName="vector";var al=class{constructor(e="",n=-1,i=[],r=C_){this.name=e,this.tracks=i,this.duration=n,this.blendMode=r,this.uuid=Ti(),this.duration<0&&this.resetDuration()}static parse(e){let n=[],i=e.tracks,r=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)n.push(CS(i[o]).scale(r));let s=new this(e.name,e.duration,n,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){let n=[],i=e.tracks,r={name:e.name,duration:e.duration,tracks:n,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,o=i.length;s!==o;++s)n.push(Nn.toJSON(i[s]));return r}static CreateFromMorphTargetSequence(e,n,i,r){let s=n.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);let u=AS(l);l=$0(l,1,u),c=$0(c,1,u),!r&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Hi(".morphTargetInfluences["+n[a].name+"]",l,c).scale(1/i))}return new this(e,-1,o)}static findByName(e,n){let i=e;if(!Array.isArray(e)){let r=e;i=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<i.length;r++)if(i[r].name===n)return i[r];return null}static CreateClipsFromMorphTargetSequences(e,n,i){let r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],u=c.name.match(s);if(u&&u.length>1){let h=u[1],d=r[h];d||(r[h]=d=[]),d.push(c)}}let o=[];for(let a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],n,i));return o}static parseAnimation(e,n){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let i=function(h,d,f,g,_){if(f.length!==0){let m=[],p=[];X_(f,m,p,g),m.length!==0&&_.push(new h(d,m,p))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode,l=e.length||-1,c=e.hierarchy||[];for(let h=0;h<c.length;h++){let d=c[h].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let _=0;_<d[g].morphTargets.length;_++)f[d[g].morphTargets[_]]=-1;for(let _ in f){let m=[],p=[];for(let E=0;E!==d[g].morphTargets.length;++E){let T=d[g];m.push(T.time),p.push(T.morphTarget===_?1:0)}r.push(new Hi(".morphTargetInfluence["+_+"]",m,p))}l=f.length*o}else{let f=".bones["+n[h].name+"]";i(zi,f+".position",d,"pos",r),i(Vi,f+".quaternion",d,"rot",r),i(zi,f+".scale",d,"scl",r)}}return r.length===0?null:new this(s,l,r,a)}resetDuration(){let e=this.tracks,n=0;for(let i=0,r=e.length;i!==r;++i){let s=this.tracks[i];n=Math.max(n,s.times[s.times.length-1])}return this.duration=n,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let n=0;n<this.tracks.length;n++)e=e&&this.tracks[n].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function RS(t){switch(t.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Hi;case"vector":case"vector2":case"vector3":case"vector4":return zi;case"color":return ol;case"quaternion":return Vi;case"bool":case"boolean":return mr;case"string":return gr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+t)}function CS(t){if(t.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=RS(t.type);if(t.times===void 0){let n=[],i=[];X_(t.keys,n,i,"value"),t.times=n,t.values=i}return e.parse!==void 0?e.parse(t):new e(t.name,t.times,t.values,t.interpolation)}var Bi={enabled:!1,files:{},add:function(t,e){this.enabled!==!1&&(this.files[t]=e)},get:function(t){if(this.enabled!==!1)return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}},nu=class{constructor(e,n,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}},q_=new nu,Gi=class{constructor(e){this.manager=e!==void 0?e:q_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){let i=this;return new Promise(function(r,s){i.load(e,r,n,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Gi.DEFAULT_MATERIAL_NAME="__DEFAULT";var ur={},xf=class extends Error{constructor(e,n){super(e),this.response=n}},Po=class extends Gi{constructor(e){super(e),this.mimeType="",this.responseType=""}load(e,n,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=Bi.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{n&&n(s),this.manager.itemEnd(e)},0),s;if(ur[e]!==void 0){ur[e].push({onLoad:n,onProgress:i,onError:r});return}ur[e]=[],ur[e].push({onLoad:n,onProgress:i,onError:r});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=ur[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,_=0,m=new ReadableStream({start(p){E();function E(){h.read().then(({done:T,value:v})=>{if(T)p.close();else{_+=v.byteLength;let C=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let A=0,b=u.length;A<b;A++){let P=u[A];P.onProgress&&P.onProgress(C)}p.enqueue(v),E()}},T=>{p.error(T)})}}});return new Response(m)}else throw new xf(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a==="")return c.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Bi.add(`file:${e}`,c);let u=ur[e];delete ur[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{let u=ur[e];if(u===void 0)throw this.manager.itemError(e),c;delete ur[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}};var vo=new WeakMap,Lo=class extends Gi{constructor(e){super(e)}load(e,n,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,o=Bi.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){n&&n(o),s.manager.itemEnd(e)},0);else{let h=vo.get(o);h===void 0&&(h=[],vo.set(o,h)),h.push({onLoad:n,onError:r})}return o}let a=Eo("img");function l(){u(),n&&n(this);let h=vo.get(this)||[];for(let d=0;d<h.length;d++){let f=h[d];f.onLoad&&f.onLoad(this)}vo.delete(this),s.manager.itemEnd(e)}function c(h){u(),r&&r(h),Bi.remove(`image:${e}`);let d=vo.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(h)}vo.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Bi.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}};var ll=class extends Gi{constructor(e){super(e)}load(e,n,i,r){let s=new an,o=new Lo(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,n!==void 0&&n(s)},i,r),s}},Cs=class extends _t{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new xe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}};var uf=new be,j0=new w,Z0=new w,cl=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ye(512,512),this.mapType=Ci,this.map=null,this.mapPass=null,this.matrix=new be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Co,this._frameExtents=new Ye(1,1),this._viewportCount=1,this._viewports=[new ut(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let n=this.camera,i=this.matrix;j0.setFromMatrixPosition(e.matrixWorld),n.position.copy(j0),Z0.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(Z0),n.updateMatrixWorld(),uf.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(uf),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(uf)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},yf=class extends cl{constructor(){super(new $t(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let n=this.camera,i=Ts*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||n.far;(i!==n.fov||r!==n.aspect||s!==n.far)&&(n.fov=i,n.aspect=r,n.far=s,n.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},ul=class extends Cs{constructor(e,n,i=0,r=Math.PI/3,s=0,o=2){super(e,n),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.distance=i,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new yf}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},K0=new be,za=new w,hf=new w,Mf=class extends cl{constructor(){super(new $t(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ye(4,2),this._viewportCount=6,this._viewports=[new ut(2,1,1,1),new ut(0,1,1,1),new ut(3,1,1,1),new ut(1,1,1,1),new ut(3,0,1,1),new ut(1,0,1,1)],this._cubeDirections=[new w(1,0,0),new w(-1,0,0),new w(0,0,1),new w(0,0,-1),new w(0,1,0),new w(0,-1,0)],this._cubeUps=[new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,0,1),new w(0,0,-1)]}updateMatrices(e,n=0){let i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),za.setFromMatrixPosition(e.matrixWorld),i.position.copy(za),hf.copy(i.position),hf.add(this._cubeDirections[n]),i.up.copy(this._cubeUps[n]),i.lookAt(hf),i.updateMatrixWorld(),r.makeTranslation(-za.x,-za.y,-za.z),K0.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(K0)}},hl=class extends Cs{constructor(e,n,i=0,r=2){super(e,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new Mf}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Is=class extends Ka{constructor(e=-1,n=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+n,l=r-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},Ef=class extends cl{constructor(){super(new Is(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ps=class extends Cs{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.shadow=new Ef}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},dl=class extends Cs{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}};var _r=class{static extractUrlBase(e){let n=e.lastIndexOf("/");return n===-1?"./":e.slice(0,n+1)}static resolveURL(e,n){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(n)&&/^\//.test(e)&&(n=n.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:n+e)}};var df=new WeakMap,fl=class extends Gi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,n,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,o=Bi.get(`image-bitmap:${e}`);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{if(df.has(o)===!0)r&&r(df.get(o)),s.manager.itemError(e),s.manager.itemEnd(e);else return n&&n(c),s.manager.itemEnd(e),c});return}return setTimeout(function(){n&&n(o),s.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return Bi.add(`image-bitmap:${e}`,c),n&&n(c),s.manager.itemEnd(e),c}).catch(function(c){r&&r(c),df.set(l,c),Bi.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});Bi.add(`image-bitmap:${e}`,l),s.manager.itemStart(e)}};var iu=class extends $t{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Xf="\\[\\]\\.:\\/",IS=new RegExp("["+Xf+"]","g"),qf="[^"+Xf+"]",PS="[^"+Xf.replace("\\.","")+"]",LS=/((?:WC+[\/:])*)/.source.replace("WC",qf),US=/(WCOD+)?/.source.replace("WCOD",PS),NS=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",qf),DS=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",qf),OS=new RegExp("^"+LS+US+NS+DS+"$"),FS=["material","materials","bones","map"],Sf=class{constructor(e,n,i){let r=i||bt.parseTrackName(n);this._targetGroup=e,this._bindings=e.subscribe_(n,r)}getValue(e,n){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,n)}setValue(e,n){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,n)}bind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].bind()}unbind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].unbind()}},bt=class t{constructor(e,n,i){this.path=n,this.parsedPath=i||t.parseTrackName(n),this.node=t.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,n,i){return e&&e.isAnimationObjectGroup?new t.Composite(e,n,i):new t(e,n,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(IS,"")}static parseTrackName(e){let n=OS.exec(e);if(n===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);FS.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,n){if(n===void 0||n===""||n==="."||n===-1||n===e.name||n===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(n);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===n||a.uuid===n)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,n){e[n]=this.targetObject[this.propertyName]}_getValue_array(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[n++]=i[r]}_getValue_arrayElement(e,n){e[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,n){this.resolvedProperty.toArray(e,n)}_setValue_direct(e,n){this.targetObject[this.propertyName]=e[n]}_setValue_direct_setNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++]}_setValue_array_setNeedsUpdate(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,n){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,n){this.resolvedProperty[this.propertyIndex]=e[n]}_setValue_arrayElement_setNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,n){this.resolvedProperty.fromArray(e,n)}_setValue_fromArray_setNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,n){this.bind(),this.getValue(e,n)}_setValue_unbound(e,n){this.bind(),this.setValue(e,n)}bind(){let e=this.node,n=this.parsedPath,i=n.objectName,r=n.propertyName,s=n.propertyIndex;if(e||(e=t.findNode(this.rootNode,n.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=n.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};bt.Composite=Sf;bt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};bt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};bt.prototype.GetterByBindingType=[bt.prototype._getValue_direct,bt.prototype._getValue_array,bt.prototype._getValue_arrayElement,bt.prototype._getValue_toArray];bt.prototype.SetterByBindingTypeAndVersioning=[[bt.prototype._setValue_direct,bt.prototype._setValue_direct_setNeedsUpdate,bt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_array,bt.prototype._setValue_array_setNeedsUpdate,bt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_arrayElement,bt.prototype._setValue_arrayElement_setNeedsUpdate,bt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_fromArray,bt.prototype._setValue_fromArray_setNeedsUpdate,bt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var iP=new Float32Array(1);var Uo=class{constructor(e,n,i,r,s,o=!1){this.isGLBufferAttribute=!0,this.name="",this.buffer=e,this.type=n,this.itemSize=i,this.elementSize=r,this.count=s,this.normalized=o,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,n){return this.type=e,this.elementSize=n,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}};var pl=class extends si{constructor(e=1){let n=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],r=new ht;r.setAttribute("position",new yn(n,3)),r.setAttribute("color",new yn(i,3));let s=new En({vertexColors:!0,toneMapped:!1});super(r,s),this.type="AxesHelper"}setColors(e,n,i){let r=new xe,s=this.geometry.attributes.color.array;return r.set(e),r.toArray(s,0),r.toArray(s,3),r.set(n),r.toArray(s,6),r.toArray(s,9),r.set(i),r.toArray(s,12),r.toArray(s,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}};function Yf(t,e,n,i){let r=BS(i);switch(n){case Nf:return t*e;case _u:return t*e/r.components*r.byteLength;case vu:return t*e/r.components*r.byteLength;case Of:return t*e*2/r.components*r.byteLength;case xu:return t*e*2/r.components*r.byteLength;case Df:return t*e*3/r.components*r.byteLength;case Yn:return t*e*4/r.components*r.byteLength;case yu:return t*e*4/r.components*r.byteLength;case gl:case _l:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case vl:case xl:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Eu:case Tu:return Math.max(t,16)*Math.max(e,8)/4;case Mu:case Su:return Math.max(t,8)*Math.max(e,8)/2;case bu:case wu:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Au:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Ru:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Cu:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case Iu:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case Pu:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case Lu:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Uu:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Nu:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case Du:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Ou:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Fu:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Bu:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case ku:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case Hu:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Vu:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case yl:case zu:case Gu:return Math.ceil(t/4)*Math.ceil(e/4)*16;case Ff:case Wu:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Xu:case qu:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function BS(t){switch(t){case Ci:case Pf:return{byteLength:1,components:1};case Do:case Lf:case Oo:return{byteLength:2,components:1};case mu:case gu:return{byteLength:2,components:4};case Xr:case pu:case oi:return{byteLength:4,components:1};case Uf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ai}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ai);function gv(){let t=null,e=!1,n=null,i=null;function r(s,o){n(s,o),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function kS(t){let e=new WeakMap;function n(a,l){let c=a.array,u=a.usage,h=c.byteLength,d=t.createBuffer();t.bindBuffer(l,d),t.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=t.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=t.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=t.HALF_FLOAT:f=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=t.SHORT;else if(c instanceof Uint32Array)f=t.UNSIGNED_INT;else if(c instanceof Int32Array)f=t.INT;else if(c instanceof Int8Array)f=t.BYTE;else if(c instanceof Uint8Array)f=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function i(a,l,c){let u=l.array,h=l.updateRanges;if(t.bindBuffer(c,a),h.length===0)t.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){let g=h[d],_=h[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){let _=h[f];t.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(t.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,n(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var HS=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,VS=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zS=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,GS=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,WS=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,XS=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,qS=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,YS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$S=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,jS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ZS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,KS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,JS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,QS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,eT=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,tT=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,nT=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,iT=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,rT=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,sT=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,oT=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,aT=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,lT=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,cT=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,uT=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,hT=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,dT=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,fT=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,pT=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,mT=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,gT="gl_FragColor = linearToOutputTexel( gl_FragColor );",_T=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,vT=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,xT=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,yT=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,MT=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ET=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ST=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,TT=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bT=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,wT=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,AT=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,RT=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,CT=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,IT=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,PT=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,LT=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,UT=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,NT=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,DT=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,OT=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,FT=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,BT=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,kT=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,HT=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,VT=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,zT=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,GT=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,WT=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,XT=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,qT=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,YT=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,$T=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,jT=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ZT=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,KT=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,JT=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,QT=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,e2=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,t2=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,n2=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,i2=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,r2=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,s2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,o2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,a2=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,l2=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,c2=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,u2=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,h2=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,d2=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,f2=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,p2=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,m2=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,g2=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_2=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,v2=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,x2=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,y2=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,M2=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,E2=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,S2=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,T2=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,b2=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,w2=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,A2=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,R2=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,C2=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,I2=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,P2=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,L2=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,U2=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,N2=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,D2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,O2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,F2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,B2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,k2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,H2=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,V2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,z2=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,W2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,X2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,q2=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Y2=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,$2=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,j2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Z2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,K2=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,J2=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Q2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,eb=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tb=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nb=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ib=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,rb=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ob=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ab=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cb=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ub=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hb=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,db=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fb=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,pb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,mb=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gb=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,_b=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,vb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:HS,alphahash_pars_fragment:VS,alphamap_fragment:zS,alphamap_pars_fragment:GS,alphatest_fragment:WS,alphatest_pars_fragment:XS,aomap_fragment:qS,aomap_pars_fragment:YS,batching_pars_vertex:$S,batching_vertex:jS,begin_vertex:ZS,beginnormal_vertex:KS,bsdfs:JS,iridescence_fragment:QS,bumpmap_pars_fragment:eT,clipping_planes_fragment:tT,clipping_planes_pars_fragment:nT,clipping_planes_pars_vertex:iT,clipping_planes_vertex:rT,color_fragment:sT,color_pars_fragment:oT,color_pars_vertex:aT,color_vertex:lT,common:cT,cube_uv_reflection_fragment:uT,defaultnormal_vertex:hT,displacementmap_pars_vertex:dT,displacementmap_vertex:fT,emissivemap_fragment:pT,emissivemap_pars_fragment:mT,colorspace_fragment:gT,colorspace_pars_fragment:_T,envmap_fragment:vT,envmap_common_pars_fragment:xT,envmap_pars_fragment:yT,envmap_pars_vertex:MT,envmap_physical_pars_fragment:LT,envmap_vertex:ET,fog_vertex:ST,fog_pars_vertex:TT,fog_fragment:bT,fog_pars_fragment:wT,gradientmap_pars_fragment:AT,lightmap_pars_fragment:RT,lights_lambert_fragment:CT,lights_lambert_pars_fragment:IT,lights_pars_begin:PT,lights_toon_fragment:UT,lights_toon_pars_fragment:NT,lights_phong_fragment:DT,lights_phong_pars_fragment:OT,lights_physical_fragment:FT,lights_physical_pars_fragment:BT,lights_fragment_begin:kT,lights_fragment_maps:HT,lights_fragment_end:VT,logdepthbuf_fragment:zT,logdepthbuf_pars_fragment:GT,logdepthbuf_pars_vertex:WT,logdepthbuf_vertex:XT,map_fragment:qT,map_pars_fragment:YT,map_particle_fragment:$T,map_particle_pars_fragment:jT,metalnessmap_fragment:ZT,metalnessmap_pars_fragment:KT,morphinstance_vertex:JT,morphcolor_vertex:QT,morphnormal_vertex:e2,morphtarget_pars_vertex:t2,morphtarget_vertex:n2,normal_fragment_begin:i2,normal_fragment_maps:r2,normal_pars_fragment:s2,normal_pars_vertex:o2,normal_vertex:a2,normalmap_pars_fragment:l2,clearcoat_normal_fragment_begin:c2,clearcoat_normal_fragment_maps:u2,clearcoat_pars_fragment:h2,iridescence_pars_fragment:d2,opaque_fragment:f2,packing:p2,premultiplied_alpha_fragment:m2,project_vertex:g2,dithering_fragment:_2,dithering_pars_fragment:v2,roughnessmap_fragment:x2,roughnessmap_pars_fragment:y2,shadowmap_pars_fragment:M2,shadowmap_pars_vertex:E2,shadowmap_vertex:S2,shadowmask_pars_fragment:T2,skinbase_vertex:b2,skinning_pars_vertex:w2,skinning_vertex:A2,skinnormal_vertex:R2,specularmap_fragment:C2,specularmap_pars_fragment:I2,tonemapping_fragment:P2,tonemapping_pars_fragment:L2,transmission_fragment:U2,transmission_pars_fragment:N2,uv_pars_fragment:D2,uv_pars_vertex:O2,uv_vertex:F2,worldpos_vertex:B2,background_vert:k2,background_frag:H2,backgroundCube_vert:V2,backgroundCube_frag:z2,cube_vert:G2,cube_frag:W2,depth_vert:X2,depth_frag:q2,distanceRGBA_vert:Y2,distanceRGBA_frag:$2,equirect_vert:j2,equirect_frag:Z2,linedashed_vert:K2,linedashed_frag:J2,meshbasic_vert:Q2,meshbasic_frag:eb,meshlambert_vert:tb,meshlambert_frag:nb,meshmatcap_vert:ib,meshmatcap_frag:rb,meshnormal_vert:sb,meshnormal_frag:ob,meshphong_vert:ab,meshphong_frag:lb,meshphysical_vert:cb,meshphysical_frag:ub,meshtoon_vert:hb,meshtoon_frag:db,points_vert:fb,points_frag:pb,shadow_vert:mb,shadow_frag:gb,sprite_vert:_b,sprite_frag:vb},se={common:{diffuse:{value:new xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ue}},envmap:{envMap:{value:null},envMapRotation:{value:new Ue},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ue},normalScale:{value:new Ye(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0},uvTransform:{value:new Ue}},sprite:{diffuse:{value:new xe(16777215)},opacity:{value:1},center:{value:new Ye(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}}},Xi={basic:{uniforms:gn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:gn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new xe(0)}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:gn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new xe(0)},specular:{value:new xe(1118481)},shininess:{value:30}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:gn([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:gn([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new xe(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:gn([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:gn([se.points,se.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:gn([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:gn([se.common,se.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:gn([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:gn([se.sprite,se.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new Ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ue}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distanceRGBA:{uniforms:gn([se.common,se.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distanceRGBA_vert,fragmentShader:je.distanceRGBA_frag},shadow:{uniforms:gn([se.lights,se.fog,{color:{value:new xe(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Xi.physical={uniforms:gn([Xi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ue},clearcoatNormalScale:{value:new Ye(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ue},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ue},sheen:{value:0},sheenColor:{value:new xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ue},transmissionSamplerSize:{value:new Ye},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ue},attenuationDistance:{value:0},attenuationColor:{value:new xe(0)},specularColor:{value:new xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ue},anisotropyVector:{value:new Ye},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ue}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};var $u={r:0,b:0,g:0},Os=new ln,xb=new be;function yb(t,e,n,i,r,s,o){let a=new xe(0),l=s===!0?0:1,c,u,h=null,d=0,f=null;function g(T){let v=T.isScene===!0?T.background:null;return v&&v.isTexture&&(v=(T.backgroundBlurriness>0?n:e).get(v)),v}function _(T){let v=!1,C=g(T);C===null?p(a,l):C&&C.isColor&&(p(C,1),v=!0);let A=t.xr.getEnvironmentBlendMode();A==="additive"?i.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(t.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function m(T,v){let C=g(v);C&&(C.isCubeTexture||C.mapping===ml)?(u===void 0&&(u=new jt(new To(1,1,1),new qn({name:"BackgroundCubeMaterial",uniforms:Ds(Xi.backgroundCube.uniforms),vertexShader:Xi.backgroundCube.vertexShader,fragmentShader:Xi.backgroundCube.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,b,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Os.copy(v.backgroundRotation),Os.x*=-1,Os.y*=-1,Os.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Os.y*=-1,Os.z*=-1),u.material.uniforms.envMap.value=C,u.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(xb.makeRotationFromEuler(Os)),u.material.toneMapped=nt.getTransfer(C.colorSpace)!==Mt,(h!==C||d!==C.version||f!==t.toneMapping)&&(u.material.needsUpdate=!0,h=C,d=C.version,f=t.toneMapping),u.layers.enableAll(),T.unshift(u,u.geometry,u.material,0,0,null)):C&&C.isTexture&&(c===void 0&&(c=new jt(new sl(2,2),new qn({name:"BackgroundMaterial",uniforms:Ds(Xi.background.uniforms),vertexShader:Xi.background.vertexShader,fragmentShader:Xi.background.fragmentShader,side:bi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=C,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=nt.getTransfer(C.colorSpace)!==Mt,C.matrixAutoUpdate===!0&&C.updateMatrix(),c.material.uniforms.uvTransform.value.copy(C.matrix),(h!==C||d!==C.version||f!==t.toneMapping)&&(c.material.needsUpdate=!0,h=C,d=C.version,f=t.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null))}function p(T,v){T.getRGB($u,Wf(t)),i.buffers.color.setClear($u.r,$u.g,$u.b,v,o)}function E(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,v=1){a.set(T),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(T){l=T,p(a,l)},render:_,addToRenderList:m,dispose:E}}function Mb(t,e){let n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=d(null),s=r,o=!1;function a(y,L,F,B,G){let $=!1,z=h(B,F,L);s!==z&&(s=z,c(s.object)),$=f(y,B,F,G),$&&g(y,B,F,G),G!==null&&e.update(G,t.ELEMENT_ARRAY_BUFFER),($||o)&&(o=!1,v(y,L,F,B),G!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function l(){return t.createVertexArray()}function c(y){return t.bindVertexArray(y)}function u(y){return t.deleteVertexArray(y)}function h(y,L,F){let B=F.wireframe===!0,G=i[y.id];G===void 0&&(G={},i[y.id]=G);let $=G[L.id];$===void 0&&($={},G[L.id]=$);let z=$[B];return z===void 0&&(z=d(l()),$[B]=z),z}function d(y){let L=[],F=[],B=[];for(let G=0;G<n;G++)L[G]=0,F[G]=0,B[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:F,attributeDivisors:B,object:y,attributes:{},index:null}}function f(y,L,F,B){let G=s.attributes,$=L.attributes,z=0,J=F.getAttributes();for(let V in J)if(J[V].location>=0){let te=G[V],we=$[V];if(we===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(we=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(we=y.instanceColor)),te===void 0||te.attribute!==we||we&&te.data!==we.data)return!0;z++}return s.attributesNum!==z||s.index!==B}function g(y,L,F,B){let G={},$=L.attributes,z=0,J=F.getAttributes();for(let V in J)if(J[V].location>=0){let te=$[V];te===void 0&&(V==="instanceMatrix"&&y.instanceMatrix&&(te=y.instanceMatrix),V==="instanceColor"&&y.instanceColor&&(te=y.instanceColor));let we={};we.attribute=te,te&&te.data&&(we.data=te.data),G[V]=we,z++}s.attributes=G,s.attributesNum=z,s.index=B}function _(){let y=s.newAttributes;for(let L=0,F=y.length;L<F;L++)y[L]=0}function m(y){p(y,0)}function p(y,L){let F=s.newAttributes,B=s.enabledAttributes,G=s.attributeDivisors;F[y]=1,B[y]===0&&(t.enableVertexAttribArray(y),B[y]=1),G[y]!==L&&(t.vertexAttribDivisor(y,L),G[y]=L)}function E(){let y=s.newAttributes,L=s.enabledAttributes;for(let F=0,B=L.length;F<B;F++)L[F]!==y[F]&&(t.disableVertexAttribArray(F),L[F]=0)}function T(y,L,F,B,G,$,z){z===!0?t.vertexAttribIPointer(y,L,F,G,$):t.vertexAttribPointer(y,L,F,B,G,$)}function v(y,L,F,B){_();let G=B.attributes,$=F.getAttributes(),z=L.defaultAttributeValues;for(let J in $){let V=$[J];if(V.location>=0){let re=G[J];if(re===void 0&&(J==="instanceMatrix"&&y.instanceMatrix&&(re=y.instanceMatrix),J==="instanceColor"&&y.instanceColor&&(re=y.instanceColor)),re!==void 0){let te=re.normalized,we=re.itemSize,qe=e.get(re);if(qe===void 0)continue;let ot=qe.buffer,q=qe.type,ne=qe.bytesPerElement,ye=q===t.INT||q===t.UNSIGNED_INT||re.gpuType===pu;if(re.isInterleavedBufferAttribute){let ae=re.data,Te=ae.stride,ce=re.offset;if(ae.isInstancedInterleavedBuffer){for(let fe=0;fe<V.locationSize;fe++)p(V.location+fe,ae.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let fe=0;fe<V.locationSize;fe++)m(V.location+fe);t.bindBuffer(t.ARRAY_BUFFER,ot);for(let fe=0;fe<V.locationSize;fe++)T(V.location+fe,we/V.locationSize,q,te,Te*ne,(ce+we/V.locationSize*fe)*ne,ye)}else{if(re.isInstancedBufferAttribute){for(let ae=0;ae<V.locationSize;ae++)p(V.location+ae,re.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let ae=0;ae<V.locationSize;ae++)m(V.location+ae);t.bindBuffer(t.ARRAY_BUFFER,ot);for(let ae=0;ae<V.locationSize;ae++)T(V.location+ae,we/V.locationSize,q,te,we*ne,we/V.locationSize*ae*ne,ye)}}else if(z!==void 0){let te=z[J];if(te!==void 0)switch(te.length){case 2:t.vertexAttrib2fv(V.location,te);break;case 3:t.vertexAttrib3fv(V.location,te);break;case 4:t.vertexAttrib4fv(V.location,te);break;default:t.vertexAttrib1fv(V.location,te)}}}}E()}function C(){P();for(let y in i){let L=i[y];for(let F in L){let B=L[F];for(let G in B)u(B[G].object),delete B[G];delete L[F]}delete i[y]}}function A(y){if(i[y.id]===void 0)return;let L=i[y.id];for(let F in L){let B=L[F];for(let G in B)u(B[G].object),delete B[G];delete L[F]}delete i[y.id]}function b(y){for(let L in i){let F=i[L];if(F[y.id]===void 0)continue;let B=F[y.id];for(let G in B)u(B[G].object),delete B[G];delete F[y.id]}}function P(){S(),o=!0,s!==r&&(s=r,c(s.object))}function S(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:P,resetDefaultState:S,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:b,initAttributes:_,enableAttribute:m,disableUnusedAttributes:E}}function Eb(t,e,n){let i;function r(c){i=c}function s(c,u){t.drawArrays(i,c,u),n.update(u,i,1)}function o(c,u,h){h!==0&&(t.drawArraysInstanced(i,c,u,h),n.update(u,i,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];n.update(f,i,1)}function l(c,u,h,d){if(h===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*d[_];n.update(g,i,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Sb(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(b){return!(b!==Yn&&i.convert(b)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let P=b===Oo&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==Ci&&i.convert(b)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==oi&&!P)}function l(b){if(b==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=n.logarithmicDepthBuffer===!0,d=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),g=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=t.getParameter(t.MAX_TEXTURE_SIZE),m=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),p=t.getParameter(t.MAX_VERTEX_ATTRIBS),E=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),T=t.getParameter(t.MAX_VARYING_VECTORS),v=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,A=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:E,maxVaryings:T,maxFragmentUniforms:v,vertexTextures:C,maxSamples:A}}function Tb(t){let e=this,n=null,i=0,r=!1,s=!1,o=new Di,a=new Ue,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||r;return r=d,i=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){n=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=t.get(h);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{let E=s?0:i,T=E*4,v=p.clippingState||null;l.value=v,v=u(g,d,T,f);for(let C=0;C!==T;++C)v[C]=n[C];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,f,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,E=d.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let T=0,v=f;T!==_;++T,v+=4)o.copy(h[T]).applyMatrix4(E,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function bb(t){let e=new WeakMap;function n(o,a){return a===hu?o.mapping=Ls:a===du&&(o.mapping=Us),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===hu||a===du)if(e.has(o)){let l=e.get(o).texture;return n(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Yc(l.height);return c.fromEquirectangularTexture(t,o),e.set(o,c),o.addEventListener("dispose",r),n(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var Vo=4,Y_=[.125,.215,.35,.446,.526,.582],ks=20,$f=new Is,$_=new xe,jf=null,Zf=0,Kf=0,Jf=!1,Bs=(1+Math.sqrt(5))/2,Ho=1/Bs,j_=[new w(-Bs,Ho,0),new w(Bs,Ho,0),new w(-Ho,0,Bs),new w(Ho,0,Bs),new w(0,Bs,-Ho),new w(0,Bs,Ho),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],wb=new w,Ku=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100,s={}){let{size:o=256,position:a=wb}=s;jf=this._renderer.getRenderTarget(),Zf=this._renderer.getActiveCubeFace(),Kf=this._renderer.getActiveMipmapLevel(),Jf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,a),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=J_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=K_(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(jf,Zf,Kf),this._renderer.xr.enabled=Jf,e.scissorTest=!1,ju(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Ls||e.mapping===Us?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),jf=this._renderer.getRenderTarget(),Zf=this._renderer.getActiveCubeFace(),Kf=this._renderer.getActiveMipmapLevel(),Jf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Mn,minFilter:Mn,generateMipmaps:!1,type:Oo,format:Yn,colorSpace:hn,depthBuffer:!1},r=Z_(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Z_(e,n,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ab(s)),this._blurMaterial=Rb(s,e,n)}return r}_compileMaterial(e){let n=new jt(this._lodPlanes[0],e);this._renderer.compile(n,$f)}_sceneToCubeUV(e,n,i,r,s){let l=new $t(90,1,n,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor($_),h.toneMapping=xr,h.autoClear=!1;let g=new Ln({name:"PMREM.Background",side:dn,depthWrite:!1,depthTest:!1}),_=new jt(new To,g),m=!1,p=e.background;p?p.isColor&&(g.color.copy(p),e.background=null,m=!0):(g.color.copy($_),m=!0);for(let E=0;E<6;E++){let T=E%3;T===0?(l.up.set(0,c[E],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[E],s.y,s.z)):T===1?(l.up.set(0,0,c[E]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[E],s.z)):(l.up.set(0,c[E],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[E]));let v=this._cubeSize;ju(r,T*v,E>2?v:0,v,v),h.setRenderTarget(r),m&&h.render(_,l),h.render(e,l)}_.geometry.dispose(),_.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=p}_textureToCubeUV(e,n){let i=this._renderer,r=e.mapping===Ls||e.mapping===Us;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=J_()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=K_());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new jt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;ju(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(o,$f)}_applyPMREM(e){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=j_[(r-s-1)%j_.length];this._blur(e,s-1,s,o,a)}n.autoClear=i}_blur(e,n,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,n,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new jt(this._lodPlanes[r],c),d=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*ks-1),_=s/g,m=isFinite(s)?1+Math.floor(u*_):ks;m>ks&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ks}`);let p=[],E=0;for(let b=0;b<ks;++b){let P=b/_,S=Math.exp(-P*P/2);p.push(S),b===0?E+=S:b<m&&(E+=2*S)}for(let b=0;b<p.length;b++)p[b]=p[b]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:T}=this;d.dTheta.value=g,d.mipInt.value=T-i;let v=this._sizeLods[r],C=3*v*(r>T-Vo?r-T+Vo:0),A=4*(this._cubeSize-v);ju(n,C,A,3*v,2*v),l.setRenderTarget(n),l.render(h,$f)}};function Ab(t){let e=[],n=[],i=[],r=t,s=t-Vo+1+Y_.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);n.push(a);let l=1/a;o>t-Vo?l=Y_[o-t+Vo-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,E=new Float32Array(_*g*f),T=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let A=0;A<f;A++){let b=A%3*2/3-1,P=A>2?0:-1,S=[b,P,0,b+2/3,P,0,b+2/3,P+1,0,b,P,0,b+2/3,P+1,0,b,P+1,0];E.set(S,_*g*A),T.set(d,m*g*A);let y=[A,A,A,A,A,A];v.set(y,p*g*A)}let C=new ht;C.setAttribute("position",new Ge(E,_)),C.setAttribute("uv",new Ge(T,m)),C.setAttribute("faceIndex",new Ge(v,p)),e.push(C),r>Vo&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function Z_(t,e,n){let i=new ki(t,e,n);return i.texture.mapping=ml,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ju(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function Rb(t,e,n){let i=new Float32Array(ks),r=new w(0,1,0);return new qn({name:"SphericalGaussianBlur",defines:{n:ks,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:lp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:vr,depthTest:!1,depthWrite:!1})}function K_(){return new qn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:lp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:vr,depthTest:!1,depthWrite:!1})}function J_(){return new qn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:lp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:vr,depthTest:!1,depthWrite:!1})}function lp(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Cb(t){let e=new WeakMap,n=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===hu||l===du,u=l===Ls||l===Us;if(c||u){let h=e.get(a),d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return n===null&&(n=new Ku(t)),h=c?n.fromEquirectangular(a,h):n.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let f=a.image;return c&&f&&f.height>0||u&&f&&r(f)?(n===null&&(n=new Ku(t)),h=c?n.fromEquirectangular(a):n.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function Ib(t){let e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let r=n(i);return r===null&&bs("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Pb(t,e,n,i){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete r[d.id];let f=s.get(d);f&&(e.remove(f),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,n.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,n.memory.geometries++),d}function l(h){let d=h.attributes;for(let f in d)e.update(d[f],t.ARRAY_BUFFER)}function c(h){let d=[],f=h.index,g=h.attributes.position,_=0;if(f!==null){let E=f.array;_=f.version;for(let T=0,v=E.length;T<v;T+=3){let C=E[T+0],A=E[T+1],b=E[T+2];d.push(C,A,A,b,b,C)}}else if(g!==void 0){let E=g.array;_=g.version;for(let T=0,v=E.length/3-1;T<v;T+=3){let C=T+0,A=T+1,b=T+2;d.push(C,A,A,b,b,C)}}else return;let m=new(Gf(d)?Za:ja)(d,1);m.version=_;let p=s.get(h);p&&e.remove(p),s.set(h,m)}function u(h){let d=s.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Lb(t,e,n){let i;function r(d){i=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function l(d,f){t.drawElements(i,f,s,d*o),n.update(f,i,1)}function c(d,f,g){g!==0&&(t.drawElementsInstanced(i,f,s,d*o,g),n.update(f,i,g))}function u(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,s,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];n.update(m,i,1)}function h(d,f,g,_){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,s,d,0,_,0,g);let p=0;for(let E=0;E<g;E++)p+=f[E]*_[E];n.update(p,i,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Ub(t){let e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(n.calls++,o){case t.TRIANGLES:n.triangles+=a*(s/3);break;case t.LINES:n.lines+=a*(s/2);break;case t.LINE_STRIP:n.lines+=a*(s-1);break;case t.LINE_LOOP:n.lines+=a*s;break;case t.POINTS:n.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function Nb(t,e,n){let i=new WeakMap,r=new ut;function s(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=i.get(a);if(d===void 0||d.count!==h){let S=function(){b.dispose(),i.delete(a),a.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],E=a.morphAttributes.color||[],T=0;f===!0&&(T=1),g===!0&&(T=2),_===!0&&(T=3);let v=a.attributes.position.count*T,C=1;v>e.maxTextureSize&&(C=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let A=new Float32Array(v*C*4*h),b=new Ya(A,v,C,h);b.type=oi,b.needsUpdate=!0;let P=T*4;for(let y=0;y<h;y++){let L=m[y],F=p[y],B=E[y],G=v*C*4*y;for(let $=0;$<L.count;$++){let z=$*P;f===!0&&(r.fromBufferAttribute(L,$),A[G+z+0]=r.x,A[G+z+1]=r.y,A[G+z+2]=r.z,A[G+z+3]=0),g===!0&&(r.fromBufferAttribute(F,$),A[G+z+4]=r.x,A[G+z+5]=r.y,A[G+z+6]=r.z,A[G+z+7]=0),_===!0&&(r.fromBufferAttribute(B,$),A[G+z+8]=r.x,A[G+z+9]=r.y,A[G+z+10]=r.z,A[G+z+11]=B.itemSize===4?r.w:1)}}d={count:h,texture:b,size:new Ye(v,C)},i.set(a,d),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",o.morphTexture,n);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(t,"morphTargetBaseInfluence",g),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",d.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",d.size)}return{update:s}}function Db(t,e,n,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:o}}var _v=new an,Q_=new rl(1,1),vv=new Ya,xv=new Xc,yv=new Ja,ev=[],tv=[],nv=new Float32Array(16),iv=new Float32Array(9),rv=new Float32Array(4);function Go(t,e,n){let i=t[0];if(i<=0||i>0)return t;let r=e*n,s=ev[r];if(s===void 0&&(s=new Float32Array(r),ev[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=n,t[o].toArray(s,a)}return s}function en(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function tn(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Qu(t,e){let n=tv[e];n===void 0&&(n=new Int32Array(e),tv[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function Ob(t,e){let n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function Fb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(en(n,e))return;t.uniform2fv(this.addr,e),tn(n,e)}}function Bb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(en(n,e))return;t.uniform3fv(this.addr,e),tn(n,e)}}function kb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(en(n,e))return;t.uniform4fv(this.addr,e),tn(n,e)}}function Hb(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(en(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),tn(n,e)}else{if(en(n,i))return;rv.set(i),t.uniformMatrix2fv(this.addr,!1,rv),tn(n,i)}}function Vb(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(en(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),tn(n,e)}else{if(en(n,i))return;iv.set(i),t.uniformMatrix3fv(this.addr,!1,iv),tn(n,i)}}function zb(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(en(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),tn(n,e)}else{if(en(n,i))return;nv.set(i),t.uniformMatrix4fv(this.addr,!1,nv),tn(n,i)}}function Gb(t,e){let n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function Wb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(en(n,e))return;t.uniform2iv(this.addr,e),tn(n,e)}}function Xb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(en(n,e))return;t.uniform3iv(this.addr,e),tn(n,e)}}function qb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(en(n,e))return;t.uniform4iv(this.addr,e),tn(n,e)}}function Yb(t,e){let n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function $b(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(en(n,e))return;t.uniform2uiv(this.addr,e),tn(n,e)}}function jb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(en(n,e))return;t.uniform3uiv(this.addr,e),tn(n,e)}}function Zb(t,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(en(n,e))return;t.uniform4uiv(this.addr,e),tn(n,e)}}function Kb(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(Q_.compareFunction=kf,s=Q_):s=_v,n.setTexture2D(e||s,r)}function Jb(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||xv,r)}function Qb(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||yv,r)}function ew(t,e,n){let i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||vv,r)}function tw(t){switch(t){case 5126:return Ob;case 35664:return Fb;case 35665:return Bb;case 35666:return kb;case 35674:return Hb;case 35675:return Vb;case 35676:return zb;case 5124:case 35670:return Gb;case 35667:case 35671:return Wb;case 35668:case 35672:return Xb;case 35669:case 35673:return qb;case 5125:return Yb;case 36294:return $b;case 36295:return jb;case 36296:return Zb;case 35678:case 36198:case 36298:case 36306:case 35682:return Kb;case 35679:case 36299:case 36307:return Jb;case 35680:case 36300:case 36308:case 36293:return Qb;case 36289:case 36303:case 36311:case 36292:return ew}}function nw(t,e){t.uniform1fv(this.addr,e)}function iw(t,e){let n=Go(e,this.size,2);t.uniform2fv(this.addr,n)}function rw(t,e){let n=Go(e,this.size,3);t.uniform3fv(this.addr,n)}function sw(t,e){let n=Go(e,this.size,4);t.uniform4fv(this.addr,n)}function ow(t,e){let n=Go(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function aw(t,e){let n=Go(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function lw(t,e){let n=Go(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function cw(t,e){t.uniform1iv(this.addr,e)}function uw(t,e){t.uniform2iv(this.addr,e)}function hw(t,e){t.uniform3iv(this.addr,e)}function dw(t,e){t.uniform4iv(this.addr,e)}function fw(t,e){t.uniform1uiv(this.addr,e)}function pw(t,e){t.uniform2uiv(this.addr,e)}function mw(t,e){t.uniform3uiv(this.addr,e)}function gw(t,e){t.uniform4uiv(this.addr,e)}function _w(t,e,n){let i=this.cache,r=e.length,s=Qu(n,r);en(i,s)||(t.uniform1iv(this.addr,s),tn(i,s));for(let o=0;o!==r;++o)n.setTexture2D(e[o]||_v,s[o])}function vw(t,e,n){let i=this.cache,r=e.length,s=Qu(n,r);en(i,s)||(t.uniform1iv(this.addr,s),tn(i,s));for(let o=0;o!==r;++o)n.setTexture3D(e[o]||xv,s[o])}function xw(t,e,n){let i=this.cache,r=e.length,s=Qu(n,r);en(i,s)||(t.uniform1iv(this.addr,s),tn(i,s));for(let o=0;o!==r;++o)n.setTextureCube(e[o]||yv,s[o])}function yw(t,e,n){let i=this.cache,r=e.length,s=Qu(n,r);en(i,s)||(t.uniform1iv(this.addr,s),tn(i,s));for(let o=0;o!==r;++o)n.setTexture2DArray(e[o]||vv,s[o])}function Mw(t){switch(t){case 5126:return nw;case 35664:return iw;case 35665:return rw;case 35666:return sw;case 35674:return ow;case 35675:return aw;case 35676:return lw;case 5124:case 35670:return cw;case 35667:case 35671:return uw;case 35668:case 35672:return hw;case 35669:case 35673:return dw;case 5125:return fw;case 36294:return pw;case 36295:return mw;case 36296:return gw;case 35678:case 36198:case 36298:case 36306:case 35682:return _w;case 35679:case 36299:case 36307:return vw;case 35680:case 36300:case 36308:case 36293:return xw;case 36289:case 36303:case 36311:case 36292:return yw}}var ep=class{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=tw(n.type)}},tp=class{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=Mw(n.type)}},np=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,n[a.id],i)}}},Qf=/(\w+)(\])?(\[|\.)?/g;function sv(t,e){t.seq.push(e),t.map[e.id]=e}function Ew(t,e,n){let i=t.name,r=i.length;for(Qf.lastIndex=0;;){let s=Qf.exec(i),o=Qf.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){sv(n,c===void 0?new ep(a,t,e):new tp(a,t,e));break}else{let h=n.map[a];h===void 0&&(h=new np(a),sv(n,h)),n=h}}}var zo=class{constructor(e,n){this.seq=[],this.map={};let i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(n,r),o=e.getUniformLocation(n,s.name);Ew(s,o,this)}}setValue(e,n,i,r){let s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){let r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,o=n.length;s!==o;++s){let a=n[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,n){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in n&&i.push(o)}return i}};function ov(t,e,n){let i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}var Sw=37297,Tw=0;function bw(t,e){let n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}var av=new Ue;function ww(t){nt._getMatrix(av,nt.workingColorSpace,t);let e=`mat3( ${av.elements.map(n=>n.toFixed(4))} )`;switch(nt.getTransfer(t)){case Xa:return[e,"LinearTransferOETF"];case Mt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function lv(t,e,n){let i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+bw(t.getShaderSource(e),o)}else return r}function Aw(t,e){let n=ww(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}function Rw(t,e){let n;switch(e){case M_:n="Linear";break;case E_:n="Reinhard";break;case S_:n="Cineon";break;case T_:n="ACESFilmic";break;case w_:n="AgX";break;case A_:n="Neutral";break;case b_:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Zu=new w;function Cw(){nt.getLuminanceCoefficients(Zu);let t=Zu.x.toFixed(4),e=Zu.y.toFixed(4),n=Zu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Iw(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Sl).join(`
`)}function Pw(t){let e=[];for(let n in t){let i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function Lw(t,e){let n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=t.getActiveAttrib(e,r),o=s.name,a=1;s.type===t.FLOAT_MAT2&&(a=2),s.type===t.FLOAT_MAT3&&(a=3),s.type===t.FLOAT_MAT4&&(a=4),n[o]={type:s.type,location:t.getAttribLocation(e,o),locationSize:a}}return n}function Sl(t){return t!==""}function cv(t,e){let n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function uv(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Uw=/^[ \t]*#include +<([\w\d./]+)>/gm;function ip(t){return t.replace(Uw,Dw)}var Nw=new Map;function Dw(t,e){let n=je[e];if(n===void 0){let i=Nw.get(e);if(i!==void 0)n=je[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return ip(n)}var Ow=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hv(t){return t.replace(Ow,Fw)}function Fw(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function dv(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Bw(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===bf?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===e_?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===Wi&&(e="SHADOWMAP_TYPE_VSM"),e}function kw(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Ls:case Us:e="ENVMAP_TYPE_CUBE";break;case ml:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Hw(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case Us:e="ENVMAP_MODE_REFRACTION";break}return e}function Vw(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case Cf:e="ENVMAP_BLENDING_MULTIPLY";break;case x_:e="ENVMAP_BLENDING_MIX";break;case y_:e="ENVMAP_BLENDING_ADD";break}return e}function zw(t){let e=t.envMapCubeUVHeight;if(e===null)return null;let n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function Gw(t,e,n,i){let r=t.getContext(),s=n.defines,o=n.vertexShader,a=n.fragmentShader,l=Bw(n),c=kw(n),u=Hw(n),h=Vw(n),d=zw(n),f=Iw(n),g=Pw(s),_=r.createProgram(),m,p,E=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(Sl).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(Sl).join(`
`),p.length>0&&(p+=`
`)):(m=[dv(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Sl).join(`
`),p=[dv(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+u:"",n.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==xr?"#define TONE_MAPPING":"",n.toneMapping!==xr?je.tonemapping_pars_fragment:"",n.toneMapping!==xr?Rw("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,Aw("linearToOutputTexel",n.outputColorSpace),Cw(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Sl).join(`
`)),o=ip(o),o=cv(o,n),o=uv(o,n),a=ip(a),a=cv(a,n),a=uv(a,n),o=hv(o),a=hv(a),n.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",n.glslVersion===Vf?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Vf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let T=E+m+o,v=E+p+a,C=ov(r,r.VERTEX_SHADER,T),A=ov(r,r.FRAGMENT_SHADER,v);r.attachShader(_,C),r.attachShader(_,A),n.index0AttributeName!==void 0?r.bindAttribLocation(_,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function b(L){if(t.debug.checkShaderErrors){let F=r.getProgramInfoLog(_).trim(),B=r.getShaderInfoLog(C).trim(),G=r.getShaderInfoLog(A).trim(),$=!0,z=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if($=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,_,C,A);else{let J=lv(r,C,"vertex"),V=lv(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+F+`
`+J+`
`+V)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(B===""||G==="")&&(z=!1);z&&(L.diagnostics={runnable:$,programLog:F,vertexShader:{log:B,prefix:m},fragmentShader:{log:G,prefix:p}})}r.deleteShader(C),r.deleteShader(A),P=new zo(r,_),S=Lw(r,_)}let P;this.getUniforms=function(){return P===void 0&&b(this),P};let S;this.getAttributes=function(){return S===void 0&&b(this),S};let y=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=r.getProgramParameter(_,Sw)),y},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Tw++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=A,this}var Ww=0,rp=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let n=this.materialCache.get(e);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let n=this.materialCache,i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){let n=this.shaderCache,i=n.get(e);return i===void 0&&(i=new sp(e),n.set(e,i)),i}},sp=class{constructor(e){this.id=Ww++,this.code=e,this.usedTimes=0}};function Xw(t,e,n,i,r,s,o){let a=new $a,l=new rp,c=new Set,u=[],h=r.logarithmicDepthBuffer,d=r.vertexTextures,f=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,y,L,F,B){let G=F.fog,$=B.geometry,z=S.isMeshStandardMaterial?F.environment:null,J=(S.isMeshStandardMaterial?n:e).get(S.envMap||z),V=J&&J.mapping===ml?J.image.height:null,re=g[S.type];S.precision!==null&&(f=r.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));let te=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,we=te!==void 0?te.length:0,qe=0;$.morphAttributes.position!==void 0&&(qe=1),$.morphAttributes.normal!==void 0&&(qe=2),$.morphAttributes.color!==void 0&&(qe=3);let ot,q,ne,ye;if(re){let mt=Xi[re];ot=mt.vertexShader,q=mt.fragmentShader}else ot=S.vertexShader,q=S.fragmentShader,l.update(S),ne=l.getVertexShaderID(S),ye=l.getFragmentShaderID(S);let ae=t.getRenderTarget(),Te=t.state.buffers.depth.getReversed(),ce=B.isInstancedMesh===!0,fe=B.isBatchedMesh===!0,at=!!S.map,pt=!!S.matcap,Ze=!!J,I=!!S.aoMap,At=!!S.lightMap,$e=!!S.bumpMap,Je=!!S.normalMap,_e=!!S.displacementMap,Ke=!!S.emissiveMap,Ae=!!S.metalnessMap,ke=!!S.roughnessMap,Ft=S.anisotropy>0,R=S.clearcoat>0,x=S.dispersion>0,D=S.iridescence>0,X=S.sheen>0,j=S.transmission>0,W=Ft&&!!S.anisotropyMap,Ie=R&&!!S.clearcoatMap,ie=R&&!!S.clearcoatNormalMap,Me=R&&!!S.clearcoatRoughnessMap,Re=D&&!!S.iridescenceMap,Z=D&&!!S.iridescenceThicknessMap,de=X&&!!S.sheenColorMap,Fe=X&&!!S.sheenRoughnessMap,Oe=!!S.specularMap,oe=!!S.specularColorMap,Ve=!!S.specularIntensityMap,U=j&&!!S.transmissionMap,le=j&&!!S.thicknessMap,K=!!S.gradientMap,me=!!S.alphaMap,Q=S.alphaTest>0,Y=!!S.alphaHash,ve=!!S.extensions,We=xr;S.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(We=t.toneMapping);let xt={shaderID:re,shaderType:S.type,shaderName:S.name,vertexShader:ot,fragmentShader:q,defines:S.defines,customVertexShaderID:ne,customFragmentShaderID:ye,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:fe,batchingColor:fe&&B._colorsTexture!==null,instancing:ce,instancingColor:ce&&B.instanceColor!==null,instancingMorph:ce&&B.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ae===null?t.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:hn,alphaToCoverage:!!S.alphaToCoverage,map:at,matcap:pt,envMap:Ze,envMapMode:Ze&&J.mapping,envMapCubeUVHeight:V,aoMap:I,lightMap:At,bumpMap:$e,normalMap:Je,displacementMap:d&&_e,emissiveMap:Ke,normalMapObjectSpace:Je&&S.normalMapType===L_,normalMapTangentSpace:Je&&S.normalMapType===El,metalnessMap:Ae,roughnessMap:ke,anisotropy:Ft,anisotropyMap:W,clearcoat:R,clearcoatMap:Ie,clearcoatNormalMap:ie,clearcoatRoughnessMap:Me,dispersion:x,iridescence:D,iridescenceMap:Re,iridescenceThicknessMap:Z,sheen:X,sheenColorMap:de,sheenRoughnessMap:Fe,specularMap:Oe,specularColorMap:oe,specularIntensityMap:Ve,transmission:j,transmissionMap:U,thicknessMap:le,gradientMap:K,opaque:S.transparent===!1&&S.blending===ys&&S.alphaToCoverage===!1,alphaMap:me,alphaTest:Q,alphaHash:Y,combine:S.combine,mapUv:at&&_(S.map.channel),aoMapUv:I&&_(S.aoMap.channel),lightMapUv:At&&_(S.lightMap.channel),bumpMapUv:$e&&_(S.bumpMap.channel),normalMapUv:Je&&_(S.normalMap.channel),displacementMapUv:_e&&_(S.displacementMap.channel),emissiveMapUv:Ke&&_(S.emissiveMap.channel),metalnessMapUv:Ae&&_(S.metalnessMap.channel),roughnessMapUv:ke&&_(S.roughnessMap.channel),anisotropyMapUv:W&&_(S.anisotropyMap.channel),clearcoatMapUv:Ie&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:ie&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Me&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Re&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Z&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:de&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Fe&&_(S.sheenRoughnessMap.channel),specularMapUv:Oe&&_(S.specularMap.channel),specularColorMapUv:oe&&_(S.specularColorMap.channel),specularIntensityMapUv:Ve&&_(S.specularIntensityMap.channel),transmissionMapUv:U&&_(S.transmissionMap.channel),thicknessMapUv:le&&_(S.thicknessMap.channel),alphaMapUv:me&&_(S.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(Je||Ft),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!$.attributes.uv&&(at||me),fog:!!G,useFog:S.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Te,skinning:B.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:we,morphTextureStride:qe,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:t.shadowMap.enabled&&L.length>0,shadowMapType:t.shadowMap.type,toneMapping:We,decodeVideoTexture:at&&S.map.isVideoTexture===!0&&nt.getTransfer(S.map.colorSpace)===Mt,decodeVideoTextureEmissive:Ke&&S.emissiveMap.isVideoTexture===!0&&nt.getTransfer(S.emissiveMap.colorSpace)===Mt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Sn,flipSided:S.side===dn,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:ve&&S.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&S.extensions.multiDraw===!0||fe)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return xt.vertexUv1s=c.has(1),xt.vertexUv2s=c.has(2),xt.vertexUv3s=c.has(3),c.clear(),xt}function p(S){let y=[];if(S.shaderID?y.push(S.shaderID):(y.push(S.customVertexShaderID),y.push(S.customFragmentShaderID)),S.defines!==void 0)for(let L in S.defines)y.push(L),y.push(S.defines[L]);return S.isRawShaderMaterial===!1&&(E(y,S),T(y,S),y.push(t.outputColorSpace)),y.push(S.customProgramCacheKey),y.join()}function E(S,y){S.push(y.precision),S.push(y.outputColorSpace),S.push(y.envMapMode),S.push(y.envMapCubeUVHeight),S.push(y.mapUv),S.push(y.alphaMapUv),S.push(y.lightMapUv),S.push(y.aoMapUv),S.push(y.bumpMapUv),S.push(y.normalMapUv),S.push(y.displacementMapUv),S.push(y.emissiveMapUv),S.push(y.metalnessMapUv),S.push(y.roughnessMapUv),S.push(y.anisotropyMapUv),S.push(y.clearcoatMapUv),S.push(y.clearcoatNormalMapUv),S.push(y.clearcoatRoughnessMapUv),S.push(y.iridescenceMapUv),S.push(y.iridescenceThicknessMapUv),S.push(y.sheenColorMapUv),S.push(y.sheenRoughnessMapUv),S.push(y.specularMapUv),S.push(y.specularColorMapUv),S.push(y.specularIntensityMapUv),S.push(y.transmissionMapUv),S.push(y.thicknessMapUv),S.push(y.combine),S.push(y.fogExp2),S.push(y.sizeAttenuation),S.push(y.morphTargetsCount),S.push(y.morphAttributeCount),S.push(y.numDirLights),S.push(y.numPointLights),S.push(y.numSpotLights),S.push(y.numSpotLightMaps),S.push(y.numHemiLights),S.push(y.numRectAreaLights),S.push(y.numDirLightShadows),S.push(y.numPointLightShadows),S.push(y.numSpotLightShadows),S.push(y.numSpotLightShadowsWithMaps),S.push(y.numLightProbes),S.push(y.shadowMapType),S.push(y.toneMapping),S.push(y.numClippingPlanes),S.push(y.numClipIntersection),S.push(y.depthPacking)}function T(S,y){a.disableAll(),y.supportsVertexTextures&&a.enable(0),y.instancing&&a.enable(1),y.instancingColor&&a.enable(2),y.instancingMorph&&a.enable(3),y.matcap&&a.enable(4),y.envMap&&a.enable(5),y.normalMapObjectSpace&&a.enable(6),y.normalMapTangentSpace&&a.enable(7),y.clearcoat&&a.enable(8),y.iridescence&&a.enable(9),y.alphaTest&&a.enable(10),y.vertexColors&&a.enable(11),y.vertexAlphas&&a.enable(12),y.vertexUv1s&&a.enable(13),y.vertexUv2s&&a.enable(14),y.vertexUv3s&&a.enable(15),y.vertexTangents&&a.enable(16),y.anisotropy&&a.enable(17),y.alphaHash&&a.enable(18),y.batching&&a.enable(19),y.dispersion&&a.enable(20),y.batchingColor&&a.enable(21),y.gradientMap&&a.enable(22),S.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reverseDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){let y=g[S.type],L;if(y){let F=Xi[y];L=Yu.clone(F.uniforms)}else L=S.uniforms;return L}function C(S,y){let L;for(let F=0,B=u.length;F<B;F++){let G=u[F];if(G.cacheKey===y){L=G,++L.usedTimes;break}}return L===void 0&&(L=new Gw(t,y,S,s),u.push(L)),L}function A(S){if(--S.usedTimes===0){let y=u.indexOf(S);u[y]=u[u.length-1],u.pop(),S.destroy()}}function b(S){l.remove(S)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:C,releaseProgram:A,releaseShaderCache:b,programs:u,dispose:P}}function qw(){let t=new WeakMap;function e(o){return t.has(o)}function n(o){let a=t.get(o);return a===void 0&&(a={},t.set(o,a)),a}function i(o){t.delete(o)}function r(o,a,l){t.get(o)[a]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function Yw(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function fv(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function pv(){let t=[],e=0,n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function o(h,d,f,g,_,m){let p=t[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},t[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?i.push(p):f.transparent===!0?r.push(p):n.push(p)}function l(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?i.unshift(p):f.transparent===!0?r.unshift(p):n.unshift(p)}function c(h,d){n.length>1&&n.sort(h||Yw),i.length>1&&i.sort(d||fv),r.length>1&&r.sort(d||fv)}function u(){for(let h=e,d=t.length;h<d;h++){let f=t[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function $w(){let t=new WeakMap;function e(i,r){let s=t.get(i),o;return s===void 0?(o=new pv,t.set(i,[o])):r>=s.length?(o=new pv,s.push(o)):o=s[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}function jw(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new w,color:new xe};break;case"SpotLight":n={position:new w,direction:new w,color:new xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new w,color:new xe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new w,skyColor:new xe,groundColor:new xe};break;case"RectAreaLight":n={color:new xe,position:new w,halfWidth:new w,halfHeight:new w};break}return t[e.id]=n,n}}}function Zw(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}var Kw=0;function Jw(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function Qw(t){let e=new jw,n=Zw(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new w);let r=new w,s=new be,o=new be;function a(c){let u=0,h=0,d=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,E=0,T=0,v=0,C=0,A=0,b=0;c.sort(Jw);for(let S=0,y=c.length;S<y;S++){let L=c[S],F=L.color,B=L.intensity,G=L.distance,$=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=F.r*B,h+=F.g*B,d+=F.b*B;else if(L.isLightProbe){for(let z=0;z<9;z++)i.probe[z].addScaledVector(L.sh.coefficients[z],B);b++}else if(L.isDirectionalLight){let z=e.get(L);if(z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let J=L.shadow,V=n.get(L);V.shadowIntensity=J.intensity,V.shadowBias=J.bias,V.shadowNormalBias=J.normalBias,V.shadowRadius=J.radius,V.shadowMapSize=J.mapSize,i.directionalShadow[f]=V,i.directionalShadowMap[f]=$,i.directionalShadowMatrix[f]=L.shadow.matrix,E++}i.directional[f]=z,f++}else if(L.isSpotLight){let z=e.get(L);z.position.setFromMatrixPosition(L.matrixWorld),z.color.copy(F).multiplyScalar(B),z.distance=G,z.coneCos=Math.cos(L.angle),z.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),z.decay=L.decay,i.spot[_]=z;let J=L.shadow;if(L.map&&(i.spotLightMap[C]=L.map,C++,J.updateMatrices(L),L.castShadow&&A++),i.spotLightMatrix[_]=J.matrix,L.castShadow){let V=n.get(L);V.shadowIntensity=J.intensity,V.shadowBias=J.bias,V.shadowNormalBias=J.normalBias,V.shadowRadius=J.radius,V.shadowMapSize=J.mapSize,i.spotShadow[_]=V,i.spotShadowMap[_]=$,v++}_++}else if(L.isRectAreaLight){let z=e.get(L);z.color.copy(F).multiplyScalar(B),z.halfWidth.set(L.width*.5,0,0),z.halfHeight.set(0,L.height*.5,0),i.rectArea[m]=z,m++}else if(L.isPointLight){let z=e.get(L);if(z.color.copy(L.color).multiplyScalar(L.intensity),z.distance=L.distance,z.decay=L.decay,L.castShadow){let J=L.shadow,V=n.get(L);V.shadowIntensity=J.intensity,V.shadowBias=J.bias,V.shadowNormalBias=J.normalBias,V.shadowRadius=J.radius,V.shadowMapSize=J.mapSize,V.shadowCameraNear=J.camera.near,V.shadowCameraFar=J.camera.far,i.pointShadow[g]=V,i.pointShadowMap[g]=$,i.pointShadowMatrix[g]=L.shadow.matrix,T++}i.point[g]=z,g++}else if(L.isHemisphereLight){let z=e.get(L);z.skyColor.copy(L.color).multiplyScalar(B),z.groundColor.copy(L.groundColor).multiplyScalar(B),i.hemi[p]=z,p++}}m>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=se.LTC_FLOAT_1,i.rectAreaLTC2=se.LTC_FLOAT_2):(i.rectAreaLTC1=se.LTC_HALF_1,i.rectAreaLTC2=se.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=d;let P=i.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==m||P.hemiLength!==p||P.numDirectionalShadows!==E||P.numPointShadows!==T||P.numSpotShadows!==v||P.numSpotMaps!==C||P.numLightProbes!==b)&&(i.directional.length=f,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=E,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=v+C-A,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=b,P.directionalLength=f,P.pointLength=g,P.spotLength=_,P.rectAreaLength=m,P.hemiLength=p,P.numDirectionalShadows=E,P.numPointShadows=T,P.numSpotShadows=v,P.numSpotMaps=C,P.numLightProbes=b,i.version=Kw++)}function l(c,u){let h=0,d=0,f=0,g=0,_=0,m=u.matrixWorldInverse;for(let p=0,E=c.length;p<E;p++){let T=c[p];if(T.isDirectionalLight){let v=i.directional[h];v.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),h++}else if(T.isSpotLight){let v=i.spot[f];v.position.setFromMatrixPosition(T.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),f++}else if(T.isRectAreaLight){let v=i.rectArea[g];v.position.setFromMatrixPosition(T.matrixWorld),v.position.applyMatrix4(m),o.identity(),s.copy(T.matrixWorld),s.premultiply(m),o.extractRotation(s),v.halfWidth.set(T.width*.5,0,0),v.halfHeight.set(0,T.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(T.isPointLight){let v=i.point[d];v.position.setFromMatrixPosition(T.matrixWorld),v.position.applyMatrix4(m),d++}else if(T.isHemisphereLight){let v=i.hemi[_];v.direction.setFromMatrixPosition(T.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:i}}function mv(t){let e=new Qw(t),n=[],i=[];function r(u){c.camera=u,n.length=0,i.length=0}function s(u){n.push(u)}function o(u){i.push(u)}function a(){e.setup(n)}function l(u){e.setupView(n,u)}let c={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function eA(t){let e=new WeakMap;function n(r,s=0){let o=e.get(r),a;return o===void 0?(a=new mv(t),e.set(r,[a])):s>=o.length?(a=new mv(t),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:n,dispose:i}}var tA=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nA=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function iA(t,e,n){let i=new Co,r=new Ye,s=new Ye,o=new ut,a=new Zc({depthPacking:P_}),l=new Kc,c={},u=n.maxTextureSize,h={[bi]:dn,[dn]:bi,[Sn]:Sn},d=new qn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ye},radius:{value:4}},vertexShader:tA,fragmentShader:nA}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new ht;g.setAttribute("position",new Ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new jt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=bf;let p=this.type;this.render=function(A,b,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let S=t.getRenderTarget(),y=t.getActiveCubeFace(),L=t.getActiveMipmapLevel(),F=t.state;F.setBlending(vr),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let B=p!==Wi&&this.type===Wi,G=p===Wi&&this.type!==Wi;for(let $=0,z=A.length;$<z;$++){let J=A[$],V=J.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",J,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);let re=V.getFrameExtents();if(r.multiply(re),s.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/re.x),r.x=s.x*re.x,V.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/re.y),r.y=s.y*re.y,V.mapSize.y=s.y)),V.map===null||B===!0||G===!0){let we=this.type!==Wi?{minFilter:un,magFilter:un}:{};V.map!==null&&V.map.dispose(),V.map=new ki(r.x,r.y,we),V.map.texture.name=J.name+".shadowMap",V.camera.updateProjectionMatrix()}t.setRenderTarget(V.map),t.clear();let te=V.getViewportCount();for(let we=0;we<te;we++){let qe=V.getViewport(we);o.set(s.x*qe.x,s.y*qe.y,s.x*qe.z,s.y*qe.w),F.viewport(o),V.updateMatrices(J,we),i=V.getFrustum(),v(b,P,V.camera,J,this.type)}V.isPointLightShadow!==!0&&this.type===Wi&&E(V,P),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,t.setRenderTarget(S,y,L)};function E(A,b){let P=e.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ki(r.x,r.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,t.setRenderTarget(A.mapPass),t.clear(),t.renderBufferDirect(b,null,P,d,_,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,t.setRenderTarget(A.map),t.clear(),t.renderBufferDirect(b,null,P,f,_,null)}function T(A,b,P,S){let y=null,L=P.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(L!==void 0)y=L;else if(y=P.isPointLight===!0?l:a,t.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0||b.alphaToCoverage===!0){let F=y.uuid,B=b.uuid,G=c[F];G===void 0&&(G={},c[F]=G);let $=G[B];$===void 0&&($=y.clone(),G[B]=$,b.addEventListener("dispose",C)),y=$}if(y.visible=b.visible,y.wireframe=b.wireframe,S===Wi?y.side=b.shadowSide!==null?b.shadowSide:b.side:y.side=b.shadowSide!==null?b.shadowSide:h[b.side],y.alphaMap=b.alphaMap,y.alphaTest=b.alphaToCoverage===!0?.5:b.alphaTest,y.map=b.map,y.clipShadows=b.clipShadows,y.clippingPlanes=b.clippingPlanes,y.clipIntersection=b.clipIntersection,y.displacementMap=b.displacementMap,y.displacementScale=b.displacementScale,y.displacementBias=b.displacementBias,y.wireframeLinewidth=b.wireframeLinewidth,y.linewidth=b.linewidth,P.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let F=t.properties.get(y);F.light=P}return y}function v(A,b,P,S,y){if(A.visible===!1)return;if(A.layers.test(b.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&y===Wi)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,A.matrixWorld);let B=e.update(A),G=A.material;if(Array.isArray(G)){let $=B.groups;for(let z=0,J=$.length;z<J;z++){let V=$[z],re=G[V.materialIndex];if(re&&re.visible){let te=T(A,re,S,y);A.onBeforeShadow(t,A,b,P,B,te,V),t.renderBufferDirect(P,null,B,te,A,V),A.onAfterShadow(t,A,b,P,B,te,V)}}}else if(G.visible){let $=T(A,G,S,y);A.onBeforeShadow(t,A,b,P,B,$,null),t.renderBufferDirect(P,null,B,$,A,null),A.onAfterShadow(t,A,b,P,B,$,null)}}let F=A.children;for(let B=0,G=F.length;B<G;B++)v(F[B],b,P,S,y)}function C(A){A.target.removeEventListener("dispose",C);for(let P in c){let S=c[P],y=A.target.uuid;y in S&&(S[y].dispose(),delete S[y])}}}var rA={[ru]:su,[ou]:cu,[au]:uu,[Ms]:lu,[su]:ru,[cu]:ou,[uu]:au,[lu]:Ms};function sA(t,e){function n(){let U=!1,le=new ut,K=null,me=new ut(0,0,0,0);return{setMask:function(Q){K!==Q&&!U&&(t.colorMask(Q,Q,Q,Q),K=Q)},setLocked:function(Q){U=Q},setClear:function(Q,Y,ve,We,xt){xt===!0&&(Q*=We,Y*=We,ve*=We),le.set(Q,Y,ve,We),me.equals(le)===!1&&(t.clearColor(Q,Y,ve,We),me.copy(le))},reset:function(){U=!1,K=null,me.set(-1,0,0,0)}}}function i(){let U=!1,le=!1,K=null,me=null,Q=null;return{setReversed:function(Y){if(le!==Y){let ve=e.get("EXT_clip_control");Y?ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.ZERO_TO_ONE_EXT):ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.NEGATIVE_ONE_TO_ONE_EXT),le=Y;let We=Q;Q=null,this.setClear(We)}},getReversed:function(){return le},setTest:function(Y){Y?ae(t.DEPTH_TEST):Te(t.DEPTH_TEST)},setMask:function(Y){K!==Y&&!U&&(t.depthMask(Y),K=Y)},setFunc:function(Y){if(le&&(Y=rA[Y]),me!==Y){switch(Y){case ru:t.depthFunc(t.NEVER);break;case su:t.depthFunc(t.ALWAYS);break;case ou:t.depthFunc(t.LESS);break;case Ms:t.depthFunc(t.LEQUAL);break;case au:t.depthFunc(t.EQUAL);break;case lu:t.depthFunc(t.GEQUAL);break;case cu:t.depthFunc(t.GREATER);break;case uu:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}me=Y}},setLocked:function(Y){U=Y},setClear:function(Y){Q!==Y&&(le&&(Y=1-Y),t.clearDepth(Y),Q=Y)},reset:function(){U=!1,K=null,me=null,Q=null,le=!1}}}function r(){let U=!1,le=null,K=null,me=null,Q=null,Y=null,ve=null,We=null,xt=null;return{setTest:function(mt){U||(mt?ae(t.STENCIL_TEST):Te(t.STENCIL_TEST))},setMask:function(mt){le!==mt&&!U&&(t.stencilMask(mt),le=mt)},setFunc:function(mt,Hn,xi){(K!==mt||me!==Hn||Q!==xi)&&(t.stencilFunc(mt,Hn,xi),K=mt,me=Hn,Q=xi)},setOp:function(mt,Hn,xi){(Y!==mt||ve!==Hn||We!==xi)&&(t.stencilOp(mt,Hn,xi),Y=mt,ve=Hn,We=xi)},setLocked:function(mt){U=mt},setClear:function(mt){xt!==mt&&(t.clearStencil(mt),xt=mt)},reset:function(){U=!1,le=null,K=null,me=null,Q=null,Y=null,ve=null,We=null,xt=null}}}let s=new n,o=new i,a=new r,l=new WeakMap,c=new WeakMap,u={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,E=null,T=null,v=null,C=null,A=null,b=new xe(0,0,0),P=0,S=!1,y=null,L=null,F=null,B=null,G=null,$=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,J=0,V=t.getParameter(t.VERSION);V.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(V)[1]),z=J>=1):V.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),z=J>=2);let re=null,te={},we=t.getParameter(t.SCISSOR_BOX),qe=t.getParameter(t.VIEWPORT),ot=new ut().fromArray(we),q=new ut().fromArray(qe);function ne(U,le,K,me){let Q=new Uint8Array(4),Y=t.createTexture();t.bindTexture(U,Y),t.texParameteri(U,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(U,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let ve=0;ve<K;ve++)U===t.TEXTURE_3D||U===t.TEXTURE_2D_ARRAY?t.texImage3D(le,0,t.RGBA,1,1,me,0,t.RGBA,t.UNSIGNED_BYTE,Q):t.texImage2D(le+ve,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,Q);return Y}let ye={};ye[t.TEXTURE_2D]=ne(t.TEXTURE_2D,t.TEXTURE_2D,1),ye[t.TEXTURE_CUBE_MAP]=ne(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),ye[t.TEXTURE_2D_ARRAY]=ne(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),ye[t.TEXTURE_3D]=ne(t.TEXTURE_3D,t.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ae(t.DEPTH_TEST),o.setFunc(Ms),$e(!1),Je(Tf),ae(t.CULL_FACE),I(vr);function ae(U){u[U]!==!0&&(t.enable(U),u[U]=!0)}function Te(U){u[U]!==!1&&(t.disable(U),u[U]=!1)}function ce(U,le){return h[U]!==le?(t.bindFramebuffer(U,le),h[U]=le,U===t.DRAW_FRAMEBUFFER&&(h[t.FRAMEBUFFER]=le),U===t.FRAMEBUFFER&&(h[t.DRAW_FRAMEBUFFER]=le),!0):!1}function fe(U,le){let K=f,me=!1;if(U){K=d.get(le),K===void 0&&(K=[],d.set(le,K));let Q=U.textures;if(K.length!==Q.length||K[0]!==t.COLOR_ATTACHMENT0){for(let Y=0,ve=Q.length;Y<ve;Y++)K[Y]=t.COLOR_ATTACHMENT0+Y;K.length=Q.length,me=!0}}else K[0]!==t.BACK&&(K[0]=t.BACK,me=!0);me&&t.drawBuffers(K)}function at(U){return g!==U?(t.useProgram(U),g=U,!0):!1}let pt={[zr]:t.FUNC_ADD,[n_]:t.FUNC_SUBTRACT,[i_]:t.FUNC_REVERSE_SUBTRACT};pt[r_]=t.MIN,pt[s_]=t.MAX;let Ze={[o_]:t.ZERO,[a_]:t.ONE,[l_]:t.SRC_COLOR,[Hc]:t.SRC_ALPHA,[p_]:t.SRC_ALPHA_SATURATE,[d_]:t.DST_COLOR,[u_]:t.DST_ALPHA,[c_]:t.ONE_MINUS_SRC_COLOR,[Vc]:t.ONE_MINUS_SRC_ALPHA,[f_]:t.ONE_MINUS_DST_COLOR,[h_]:t.ONE_MINUS_DST_ALPHA,[m_]:t.CONSTANT_COLOR,[g_]:t.ONE_MINUS_CONSTANT_COLOR,[__]:t.CONSTANT_ALPHA,[v_]:t.ONE_MINUS_CONSTANT_ALPHA};function I(U,le,K,me,Q,Y,ve,We,xt,mt){if(U===vr){_===!0&&(Te(t.BLEND),_=!1);return}if(_===!1&&(ae(t.BLEND),_=!0),U!==t_){if(U!==m||mt!==S){if((p!==zr||v!==zr)&&(t.blendEquation(t.FUNC_ADD),p=zr,v=zr),mt)switch(U){case ys:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case wf:t.blendFunc(t.ONE,t.ONE);break;case Af:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Rf:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case ys:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case wf:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case Af:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Rf:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}E=null,T=null,C=null,A=null,b.set(0,0,0),P=0,m=U,S=mt}return}Q=Q||le,Y=Y||K,ve=ve||me,(le!==p||Q!==v)&&(t.blendEquationSeparate(pt[le],pt[Q]),p=le,v=Q),(K!==E||me!==T||Y!==C||ve!==A)&&(t.blendFuncSeparate(Ze[K],Ze[me],Ze[Y],Ze[ve]),E=K,T=me,C=Y,A=ve),(We.equals(b)===!1||xt!==P)&&(t.blendColor(We.r,We.g,We.b,xt),b.copy(We),P=xt),m=U,S=!1}function At(U,le){U.side===Sn?Te(t.CULL_FACE):ae(t.CULL_FACE);let K=U.side===dn;le&&(K=!K),$e(K),U.blending===ys&&U.transparent===!1?I(vr):I(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),s.setMask(U.colorWrite);let me=U.stencilWrite;a.setTest(me),me&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Ke(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ae(t.SAMPLE_ALPHA_TO_COVERAGE):Te(t.SAMPLE_ALPHA_TO_COVERAGE)}function $e(U){y!==U&&(U?t.frontFace(t.CW):t.frontFace(t.CCW),y=U)}function Je(U){U!==J0?(ae(t.CULL_FACE),U!==L&&(U===Tf?t.cullFace(t.BACK):U===Q0?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):Te(t.CULL_FACE),L=U}function _e(U){U!==F&&(z&&t.lineWidth(U),F=U)}function Ke(U,le,K){U?(ae(t.POLYGON_OFFSET_FILL),(B!==le||G!==K)&&(t.polygonOffset(le,K),B=le,G=K)):Te(t.POLYGON_OFFSET_FILL)}function Ae(U){U?ae(t.SCISSOR_TEST):Te(t.SCISSOR_TEST)}function ke(U){U===void 0&&(U=t.TEXTURE0+$-1),re!==U&&(t.activeTexture(U),re=U)}function Ft(U,le,K){K===void 0&&(re===null?K=t.TEXTURE0+$-1:K=re);let me=te[K];me===void 0&&(me={type:void 0,texture:void 0},te[K]=me),(me.type!==U||me.texture!==le)&&(re!==K&&(t.activeTexture(K),re=K),t.bindTexture(U,le||ye[U]),me.type=U,me.texture=le)}function R(){let U=te[re];U!==void 0&&U.type!==void 0&&(t.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function x(){try{t.compressedTexImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function D(){try{t.compressedTexImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function X(){try{t.texSubImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function j(){try{t.texSubImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function W(){try{t.compressedTexSubImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ie(){try{t.compressedTexSubImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ie(){try{t.texStorage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Me(){try{t.texStorage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Re(){try{t.texImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Z(){try{t.texImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function de(U){ot.equals(U)===!1&&(t.scissor(U.x,U.y,U.z,U.w),ot.copy(U))}function Fe(U){q.equals(U)===!1&&(t.viewport(U.x,U.y,U.z,U.w),q.copy(U))}function Oe(U,le){let K=c.get(le);K===void 0&&(K=new WeakMap,c.set(le,K));let me=K.get(U);me===void 0&&(me=t.getUniformBlockIndex(le,U.name),K.set(U,me))}function oe(U,le){let me=c.get(le).get(U);l.get(le)!==me&&(t.uniformBlockBinding(le,me,U.__bindingPointIndex),l.set(le,me))}function Ve(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),o.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),u={},re=null,te={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,E=null,T=null,v=null,C=null,A=null,b=new xe(0,0,0),P=0,S=!1,y=null,L=null,F=null,B=null,G=null,ot.set(0,0,t.canvas.width,t.canvas.height),q.set(0,0,t.canvas.width,t.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ae,disable:Te,bindFramebuffer:ce,drawBuffers:fe,useProgram:at,setBlending:I,setMaterial:At,setFlipSided:$e,setCullFace:Je,setLineWidth:_e,setPolygonOffset:Ke,setScissorTest:Ae,activeTexture:ke,bindTexture:Ft,unbindTexture:R,compressedTexImage2D:x,compressedTexImage3D:D,texImage2D:Re,texImage3D:Z,updateUBOMapping:Oe,uniformBlockBinding:oe,texStorage2D:ie,texStorage3D:Me,texSubImage2D:X,texSubImage3D:j,compressedTexSubImage2D:W,compressedTexSubImage3D:Ie,scissor:de,viewport:Fe,reset:Ve}}function oA(t,e,n,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ye,u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,x){return f?new OffscreenCanvas(R,x):Eo("canvas")}function _(R,x,D){let X=1,j=Ft(R);if((j.width>D||j.height>D)&&(X=D/Math.max(j.width,j.height)),X<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let W=Math.floor(X*j.width),Ie=Math.floor(X*j.height);h===void 0&&(h=g(W,Ie));let ie=x?g(W,Ie):h;return ie.width=W,ie.height=Ie,ie.getContext("2d").drawImage(R,0,0,W,Ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+W+"x"+Ie+")."),ie}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function m(R){return R.generateMipmaps}function p(R){t.generateMipmap(R)}function E(R){return R.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?t.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?t.TEXTURE_2D_ARRAY:t.TEXTURE_2D}function T(R,x,D,X,j=!1){if(R!==null){if(t[R]!==void 0)return t[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let W=x;if(x===t.RED&&(D===t.FLOAT&&(W=t.R32F),D===t.HALF_FLOAT&&(W=t.R16F),D===t.UNSIGNED_BYTE&&(W=t.R8)),x===t.RED_INTEGER&&(D===t.UNSIGNED_BYTE&&(W=t.R8UI),D===t.UNSIGNED_SHORT&&(W=t.R16UI),D===t.UNSIGNED_INT&&(W=t.R32UI),D===t.BYTE&&(W=t.R8I),D===t.SHORT&&(W=t.R16I),D===t.INT&&(W=t.R32I)),x===t.RG&&(D===t.FLOAT&&(W=t.RG32F),D===t.HALF_FLOAT&&(W=t.RG16F),D===t.UNSIGNED_BYTE&&(W=t.RG8)),x===t.RG_INTEGER&&(D===t.UNSIGNED_BYTE&&(W=t.RG8UI),D===t.UNSIGNED_SHORT&&(W=t.RG16UI),D===t.UNSIGNED_INT&&(W=t.RG32UI),D===t.BYTE&&(W=t.RG8I),D===t.SHORT&&(W=t.RG16I),D===t.INT&&(W=t.RG32I)),x===t.RGB_INTEGER&&(D===t.UNSIGNED_BYTE&&(W=t.RGB8UI),D===t.UNSIGNED_SHORT&&(W=t.RGB16UI),D===t.UNSIGNED_INT&&(W=t.RGB32UI),D===t.BYTE&&(W=t.RGB8I),D===t.SHORT&&(W=t.RGB16I),D===t.INT&&(W=t.RGB32I)),x===t.RGBA_INTEGER&&(D===t.UNSIGNED_BYTE&&(W=t.RGBA8UI),D===t.UNSIGNED_SHORT&&(W=t.RGBA16UI),D===t.UNSIGNED_INT&&(W=t.RGBA32UI),D===t.BYTE&&(W=t.RGBA8I),D===t.SHORT&&(W=t.RGBA16I),D===t.INT&&(W=t.RGBA32I)),x===t.RGB&&D===t.UNSIGNED_INT_5_9_9_9_REV&&(W=t.RGB9_E5),x===t.RGBA){let Ie=j?Xa:nt.getTransfer(X);D===t.FLOAT&&(W=t.RGBA32F),D===t.HALF_FLOAT&&(W=t.RGBA16F),D===t.UNSIGNED_BYTE&&(W=Ie===Mt?t.SRGB8_ALPHA8:t.RGBA8),D===t.UNSIGNED_SHORT_4_4_4_4&&(W=t.RGBA4),D===t.UNSIGNED_SHORT_5_5_5_1&&(W=t.RGB5_A1)}return(W===t.R16F||W===t.R32F||W===t.RG16F||W===t.RG32F||W===t.RGBA16F||W===t.RGBA32F)&&e.get("EXT_color_buffer_float"),W}function v(R,x){let D;return R?x===null||x===Xr||x===Fo?D=t.DEPTH24_STENCIL8:x===oi?D=t.DEPTH32F_STENCIL8:x===Do&&(D=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Xr||x===Fo?D=t.DEPTH_COMPONENT24:x===oi?D=t.DEPTH_COMPONENT32F:x===Do&&(D=t.DEPTH_COMPONENT16),D}function C(R,x){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==un&&R.minFilter!==Mn?Math.log2(Math.max(x.width,x.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?x.mipmaps.length:1}function A(R){let x=R.target;x.removeEventListener("dispose",A),P(x),x.isVideoTexture&&u.delete(x)}function b(R){let x=R.target;x.removeEventListener("dispose",b),y(x)}function P(R){let x=i.get(R);if(x.__webglInit===void 0)return;let D=R.source,X=d.get(D);if(X){let j=X[x.__cacheKey];j.usedTimes--,j.usedTimes===0&&S(R),Object.keys(X).length===0&&d.delete(D)}i.remove(R)}function S(R){let x=i.get(R);t.deleteTexture(x.__webglTexture);let D=R.source,X=d.get(D);delete X[x.__cacheKey],o.memory.textures--}function y(R){let x=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(x.__webglFramebuffer[X]))for(let j=0;j<x.__webglFramebuffer[X].length;j++)t.deleteFramebuffer(x.__webglFramebuffer[X][j]);else t.deleteFramebuffer(x.__webglFramebuffer[X]);x.__webglDepthbuffer&&t.deleteRenderbuffer(x.__webglDepthbuffer[X])}else{if(Array.isArray(x.__webglFramebuffer))for(let X=0;X<x.__webglFramebuffer.length;X++)t.deleteFramebuffer(x.__webglFramebuffer[X]);else t.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&t.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&t.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let X=0;X<x.__webglColorRenderbuffer.length;X++)x.__webglColorRenderbuffer[X]&&t.deleteRenderbuffer(x.__webglColorRenderbuffer[X]);x.__webglDepthRenderbuffer&&t.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let D=R.textures;for(let X=0,j=D.length;X<j;X++){let W=i.get(D[X]);W.__webglTexture&&(t.deleteTexture(W.__webglTexture),o.memory.textures--),i.remove(D[X])}i.remove(R)}let L=0;function F(){L=0}function B(){let R=L;return R>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+r.maxTextures),L+=1,R}function G(R){let x=[];return x.push(R.wrapS),x.push(R.wrapT),x.push(R.wrapR||0),x.push(R.magFilter),x.push(R.minFilter),x.push(R.anisotropy),x.push(R.internalFormat),x.push(R.format),x.push(R.type),x.push(R.generateMipmaps),x.push(R.premultiplyAlpha),x.push(R.flipY),x.push(R.unpackAlignment),x.push(R.colorSpace),x.join()}function $(R,x){let D=i.get(R);if(R.isVideoTexture&&Ae(R),R.isRenderTargetTexture===!1&&R.version>0&&D.__version!==R.version){let X=R.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ye(D,R,x);return}}n.bindTexture(t.TEXTURE_2D,D.__webglTexture,t.TEXTURE0+x)}function z(R,x){let D=i.get(R);if(R.version>0&&D.__version!==R.version){ye(D,R,x);return}n.bindTexture(t.TEXTURE_2D_ARRAY,D.__webglTexture,t.TEXTURE0+x)}function J(R,x){let D=i.get(R);if(R.version>0&&D.__version!==R.version){ye(D,R,x);return}n.bindTexture(t.TEXTURE_3D,D.__webglTexture,t.TEXTURE0+x)}function V(R,x){let D=i.get(R);if(R.version>0&&D.__version!==R.version){ae(D,R,x);return}n.bindTexture(t.TEXTURE_CUBE_MAP,D.__webglTexture,t.TEXTURE0+x)}let re={[Gr]:t.REPEAT,[Oi]:t.CLAMP_TO_EDGE,[yo]:t.MIRRORED_REPEAT},te={[un]:t.NEAREST,[fu]:t.NEAREST_MIPMAP_NEAREST,[Ns]:t.NEAREST_MIPMAP_LINEAR,[Mn]:t.LINEAR,[No]:t.LINEAR_MIPMAP_NEAREST,[Ri]:t.LINEAR_MIPMAP_LINEAR},we={[U_]:t.NEVER,[k_]:t.ALWAYS,[N_]:t.LESS,[kf]:t.LEQUAL,[D_]:t.EQUAL,[B_]:t.GEQUAL,[O_]:t.GREATER,[F_]:t.NOTEQUAL};function qe(R,x){if(x.type===oi&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Mn||x.magFilter===No||x.magFilter===Ns||x.magFilter===Ri||x.minFilter===Mn||x.minFilter===No||x.minFilter===Ns||x.minFilter===Ri)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(R,t.TEXTURE_WRAP_S,re[x.wrapS]),t.texParameteri(R,t.TEXTURE_WRAP_T,re[x.wrapT]),(R===t.TEXTURE_3D||R===t.TEXTURE_2D_ARRAY)&&t.texParameteri(R,t.TEXTURE_WRAP_R,re[x.wrapR]),t.texParameteri(R,t.TEXTURE_MAG_FILTER,te[x.magFilter]),t.texParameteri(R,t.TEXTURE_MIN_FILTER,te[x.minFilter]),x.compareFunction&&(t.texParameteri(R,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(R,t.TEXTURE_COMPARE_FUNC,we[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===un||x.minFilter!==Ns&&x.minFilter!==Ri||x.type===oi&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){let D=e.get("EXT_texture_filter_anisotropic");t.texParameterf(R,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function ot(R,x){let D=!1;R.__webglInit===void 0&&(R.__webglInit=!0,x.addEventListener("dispose",A));let X=x.source,j=d.get(X);j===void 0&&(j={},d.set(X,j));let W=G(x);if(W!==R.__cacheKey){j[W]===void 0&&(j[W]={texture:t.createTexture(),usedTimes:0},o.memory.textures++,D=!0),j[W].usedTimes++;let Ie=j[R.__cacheKey];Ie!==void 0&&(j[R.__cacheKey].usedTimes--,Ie.usedTimes===0&&S(x)),R.__cacheKey=W,R.__webglTexture=j[W].texture}return D}function q(R,x,D){return Math.floor(Math.floor(R/D)/x)}function ne(R,x,D,X){let W=R.updateRanges;if(W.length===0)n.texSubImage2D(t.TEXTURE_2D,0,0,0,x.width,x.height,D,X,x.data);else{W.sort((Z,de)=>Z.start-de.start);let Ie=0;for(let Z=1;Z<W.length;Z++){let de=W[Ie],Fe=W[Z],Oe=de.start+de.count,oe=q(Fe.start,x.width,4),Ve=q(de.start,x.width,4);Fe.start<=Oe+1&&oe===Ve&&q(Fe.start+Fe.count-1,x.width,4)===oe?de.count=Math.max(de.count,Fe.start+Fe.count-de.start):(++Ie,W[Ie]=Fe)}W.length=Ie+1;let ie=t.getParameter(t.UNPACK_ROW_LENGTH),Me=t.getParameter(t.UNPACK_SKIP_PIXELS),Re=t.getParameter(t.UNPACK_SKIP_ROWS);t.pixelStorei(t.UNPACK_ROW_LENGTH,x.width);for(let Z=0,de=W.length;Z<de;Z++){let Fe=W[Z],Oe=Math.floor(Fe.start/4),oe=Math.ceil(Fe.count/4),Ve=Oe%x.width,U=Math.floor(Oe/x.width),le=oe,K=1;t.pixelStorei(t.UNPACK_SKIP_PIXELS,Ve),t.pixelStorei(t.UNPACK_SKIP_ROWS,U),n.texSubImage2D(t.TEXTURE_2D,0,Ve,U,le,K,D,X,x.data)}R.clearUpdateRanges(),t.pixelStorei(t.UNPACK_ROW_LENGTH,ie),t.pixelStorei(t.UNPACK_SKIP_PIXELS,Me),t.pixelStorei(t.UNPACK_SKIP_ROWS,Re)}}function ye(R,x,D){let X=t.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(X=t.TEXTURE_2D_ARRAY),x.isData3DTexture&&(X=t.TEXTURE_3D);let j=ot(R,x),W=x.source;n.bindTexture(X,R.__webglTexture,t.TEXTURE0+D);let Ie=i.get(W);if(W.version!==Ie.__version||j===!0){n.activeTexture(t.TEXTURE0+D);let ie=nt.getPrimaries(nt.workingColorSpace),Me=x.colorSpace===yr?null:nt.getPrimaries(x.colorSpace),Re=x.colorSpace===yr||ie===Me?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Re);let Z=_(x.image,!1,r.maxTextureSize);Z=ke(x,Z);let de=s.convert(x.format,x.colorSpace),Fe=s.convert(x.type),Oe=T(x.internalFormat,de,Fe,x.colorSpace,x.isVideoTexture);qe(X,x);let oe,Ve=x.mipmaps,U=x.isVideoTexture!==!0,le=Ie.__version===void 0||j===!0,K=W.dataReady,me=C(x,Z);if(x.isDepthTexture)Oe=v(x.format===Bo,x.type),le&&(U?n.texStorage2D(t.TEXTURE_2D,1,Oe,Z.width,Z.height):n.texImage2D(t.TEXTURE_2D,0,Oe,Z.width,Z.height,0,de,Fe,null));else if(x.isDataTexture)if(Ve.length>0){U&&le&&n.texStorage2D(t.TEXTURE_2D,me,Oe,Ve[0].width,Ve[0].height);for(let Q=0,Y=Ve.length;Q<Y;Q++)oe=Ve[Q],U?K&&n.texSubImage2D(t.TEXTURE_2D,Q,0,0,oe.width,oe.height,de,Fe,oe.data):n.texImage2D(t.TEXTURE_2D,Q,Oe,oe.width,oe.height,0,de,Fe,oe.data);x.generateMipmaps=!1}else U?(le&&n.texStorage2D(t.TEXTURE_2D,me,Oe,Z.width,Z.height),K&&ne(x,Z,de,Fe)):n.texImage2D(t.TEXTURE_2D,0,Oe,Z.width,Z.height,0,de,Fe,Z.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){U&&le&&n.texStorage3D(t.TEXTURE_2D_ARRAY,me,Oe,Ve[0].width,Ve[0].height,Z.depth);for(let Q=0,Y=Ve.length;Q<Y;Q++)if(oe=Ve[Q],x.format!==Yn)if(de!==null)if(U){if(K)if(x.layerUpdates.size>0){let ve=Yf(oe.width,oe.height,x.format,x.type);for(let We of x.layerUpdates){let xt=oe.data.subarray(We*ve/oe.data.BYTES_PER_ELEMENT,(We+1)*ve/oe.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Q,0,0,We,oe.width,oe.height,1,de,xt)}x.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Q,0,0,0,oe.width,oe.height,Z.depth,de,oe.data)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,Q,Oe,oe.width,oe.height,Z.depth,0,oe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else U?K&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,Q,0,0,0,oe.width,oe.height,Z.depth,de,Fe,oe.data):n.texImage3D(t.TEXTURE_2D_ARRAY,Q,Oe,oe.width,oe.height,Z.depth,0,de,Fe,oe.data)}else{U&&le&&n.texStorage2D(t.TEXTURE_2D,me,Oe,Ve[0].width,Ve[0].height);for(let Q=0,Y=Ve.length;Q<Y;Q++)oe=Ve[Q],x.format!==Yn?de!==null?U?K&&n.compressedTexSubImage2D(t.TEXTURE_2D,Q,0,0,oe.width,oe.height,de,oe.data):n.compressedTexImage2D(t.TEXTURE_2D,Q,Oe,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):U?K&&n.texSubImage2D(t.TEXTURE_2D,Q,0,0,oe.width,oe.height,de,Fe,oe.data):n.texImage2D(t.TEXTURE_2D,Q,Oe,oe.width,oe.height,0,de,Fe,oe.data)}else if(x.isDataArrayTexture)if(U){if(le&&n.texStorage3D(t.TEXTURE_2D_ARRAY,me,Oe,Z.width,Z.height,Z.depth),K)if(x.layerUpdates.size>0){let Q=Yf(Z.width,Z.height,x.format,x.type);for(let Y of x.layerUpdates){let ve=Z.data.subarray(Y*Q/Z.data.BYTES_PER_ELEMENT,(Y+1)*Q/Z.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Y,Z.width,Z.height,1,de,Fe,ve)}x.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,de,Fe,Z.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Oe,Z.width,Z.height,Z.depth,0,de,Fe,Z.data);else if(x.isData3DTexture)U?(le&&n.texStorage3D(t.TEXTURE_3D,me,Oe,Z.width,Z.height,Z.depth),K&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,de,Fe,Z.data)):n.texImage3D(t.TEXTURE_3D,0,Oe,Z.width,Z.height,Z.depth,0,de,Fe,Z.data);else if(x.isFramebufferTexture){if(le)if(U)n.texStorage2D(t.TEXTURE_2D,me,Oe,Z.width,Z.height);else{let Q=Z.width,Y=Z.height;for(let ve=0;ve<me;ve++)n.texImage2D(t.TEXTURE_2D,ve,Oe,Q,Y,0,de,Fe,null),Q>>=1,Y>>=1}}else if(Ve.length>0){if(U&&le){let Q=Ft(Ve[0]);n.texStorage2D(t.TEXTURE_2D,me,Oe,Q.width,Q.height)}for(let Q=0,Y=Ve.length;Q<Y;Q++)oe=Ve[Q],U?K&&n.texSubImage2D(t.TEXTURE_2D,Q,0,0,de,Fe,oe):n.texImage2D(t.TEXTURE_2D,Q,Oe,de,Fe,oe);x.generateMipmaps=!1}else if(U){if(le){let Q=Ft(Z);n.texStorage2D(t.TEXTURE_2D,me,Oe,Q.width,Q.height)}K&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,de,Fe,Z)}else n.texImage2D(t.TEXTURE_2D,0,Oe,de,Fe,Z);m(x)&&p(X),Ie.__version=W.version,x.onUpdate&&x.onUpdate(x)}R.__version=x.version}function ae(R,x,D){if(x.image.length!==6)return;let X=ot(R,x),j=x.source;n.bindTexture(t.TEXTURE_CUBE_MAP,R.__webglTexture,t.TEXTURE0+D);let W=i.get(j);if(j.version!==W.__version||X===!0){n.activeTexture(t.TEXTURE0+D);let Ie=nt.getPrimaries(nt.workingColorSpace),ie=x.colorSpace===yr?null:nt.getPrimaries(x.colorSpace),Me=x.colorSpace===yr||Ie===ie?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);let Re=x.isCompressedTexture||x.image[0].isCompressedTexture,Z=x.image[0]&&x.image[0].isDataTexture,de=[];for(let Y=0;Y<6;Y++)!Re&&!Z?de[Y]=_(x.image[Y],!0,r.maxCubemapSize):de[Y]=Z?x.image[Y].image:x.image[Y],de[Y]=ke(x,de[Y]);let Fe=de[0],Oe=s.convert(x.format,x.colorSpace),oe=s.convert(x.type),Ve=T(x.internalFormat,Oe,oe,x.colorSpace),U=x.isVideoTexture!==!0,le=W.__version===void 0||X===!0,K=j.dataReady,me=C(x,Fe);qe(t.TEXTURE_CUBE_MAP,x);let Q;if(Re){U&&le&&n.texStorage2D(t.TEXTURE_CUBE_MAP,me,Ve,Fe.width,Fe.height);for(let Y=0;Y<6;Y++){Q=de[Y].mipmaps;for(let ve=0;ve<Q.length;ve++){let We=Q[ve];x.format!==Yn?Oe!==null?U?K&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,0,0,We.width,We.height,Oe,We.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,Ve,We.width,We.height,0,We.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?K&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,0,0,We.width,We.height,Oe,oe,We.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve,Ve,We.width,We.height,0,Oe,oe,We.data)}}}else{if(Q=x.mipmaps,U&&le){Q.length>0&&me++;let Y=Ft(de[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,me,Ve,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(Z){U?K&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,de[Y].width,de[Y].height,Oe,oe,de[Y].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,Ve,de[Y].width,de[Y].height,0,Oe,oe,de[Y].data);for(let ve=0;ve<Q.length;ve++){let xt=Q[ve].image[Y].image;U?K&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,0,0,xt.width,xt.height,Oe,oe,xt.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,Ve,xt.width,xt.height,0,Oe,oe,xt.data)}}else{U?K&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,Oe,oe,de[Y]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,Ve,Oe,oe,de[Y]);for(let ve=0;ve<Q.length;ve++){let We=Q[ve];U?K&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,0,0,Oe,oe,We.image[Y]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Y,ve+1,Ve,Oe,oe,We.image[Y])}}}m(x)&&p(t.TEXTURE_CUBE_MAP),W.__version=j.version,x.onUpdate&&x.onUpdate(x)}R.__version=x.version}function Te(R,x,D,X,j,W){let Ie=s.convert(D.format,D.colorSpace),ie=s.convert(D.type),Me=T(D.internalFormat,Ie,ie,D.colorSpace),Re=i.get(x),Z=i.get(D);if(Z.__renderTarget=x,!Re.__hasExternalTextures){let de=Math.max(1,x.width>>W),Fe=Math.max(1,x.height>>W);j===t.TEXTURE_3D||j===t.TEXTURE_2D_ARRAY?n.texImage3D(j,W,Me,de,Fe,x.depth,0,Ie,ie,null):n.texImage2D(j,W,Me,de,Fe,0,Ie,ie,null)}n.bindFramebuffer(t.FRAMEBUFFER,R),Ke(x)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,X,j,Z.__webglTexture,0,_e(x)):(j===t.TEXTURE_2D||j>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,X,j,Z.__webglTexture,W),n.bindFramebuffer(t.FRAMEBUFFER,null)}function ce(R,x,D){if(t.bindRenderbuffer(t.RENDERBUFFER,R),x.depthBuffer){let X=x.depthTexture,j=X&&X.isDepthTexture?X.type:null,W=v(x.stencilBuffer,j),Ie=x.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ie=_e(x);Ke(x)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,ie,W,x.width,x.height):D?t.renderbufferStorageMultisample(t.RENDERBUFFER,ie,W,x.width,x.height):t.renderbufferStorage(t.RENDERBUFFER,W,x.width,x.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,Ie,t.RENDERBUFFER,R)}else{let X=x.textures;for(let j=0;j<X.length;j++){let W=X[j],Ie=s.convert(W.format,W.colorSpace),ie=s.convert(W.type),Me=T(W.internalFormat,Ie,ie,W.colorSpace),Re=_e(x);D&&Ke(x)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,Re,Me,x.width,x.height):Ke(x)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Re,Me,x.width,x.height):t.renderbufferStorage(t.RENDERBUFFER,Me,x.width,x.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function fe(R,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,R),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let X=i.get(x.depthTexture);X.__renderTarget=x,(!X.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),$(x.depthTexture,0);let j=X.__webglTexture,W=_e(x);if(x.depthTexture.format===Mo)Ke(x)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,j,0,W):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,j,0);else if(x.depthTexture.format===Bo)Ke(x)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,j,0,W):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function at(R){let x=i.get(R),D=R.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==R.depthTexture){let X=R.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),X){let j=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,X.removeEventListener("dispose",j)};X.addEventListener("dispose",j),x.__depthDisposeCallback=j}x.__boundDepthTexture=X}if(R.depthTexture&&!x.__autoAllocateDepthBuffer){if(D)throw new Error("target.depthTexture not supported in Cube render targets");let X=R.texture.mipmaps;X&&X.length>0?fe(x.__webglFramebuffer[0],R):fe(x.__webglFramebuffer,R)}else if(D){x.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(n.bindFramebuffer(t.FRAMEBUFFER,x.__webglFramebuffer[X]),x.__webglDepthbuffer[X]===void 0)x.__webglDepthbuffer[X]=t.createRenderbuffer(),ce(x.__webglDepthbuffer[X],R,!1);else{let j=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,W=x.__webglDepthbuffer[X];t.bindRenderbuffer(t.RENDERBUFFER,W),t.framebufferRenderbuffer(t.FRAMEBUFFER,j,t.RENDERBUFFER,W)}}else{let X=R.texture.mipmaps;if(X&&X.length>0?n.bindFramebuffer(t.FRAMEBUFFER,x.__webglFramebuffer[0]):n.bindFramebuffer(t.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=t.createRenderbuffer(),ce(x.__webglDepthbuffer,R,!1);else{let j=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,W=x.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,W),t.framebufferRenderbuffer(t.FRAMEBUFFER,j,t.RENDERBUFFER,W)}}n.bindFramebuffer(t.FRAMEBUFFER,null)}function pt(R,x,D){let X=i.get(R);x!==void 0&&Te(X.__webglFramebuffer,R,R.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),D!==void 0&&at(R)}function Ze(R){let x=R.texture,D=i.get(R),X=i.get(x);R.addEventListener("dispose",b);let j=R.textures,W=R.isWebGLCubeRenderTarget===!0,Ie=j.length>1;if(Ie||(X.__webglTexture===void 0&&(X.__webglTexture=t.createTexture()),X.__version=x.version,o.memory.textures++),W){D.__webglFramebuffer=[];for(let ie=0;ie<6;ie++)if(x.mipmaps&&x.mipmaps.length>0){D.__webglFramebuffer[ie]=[];for(let Me=0;Me<x.mipmaps.length;Me++)D.__webglFramebuffer[ie][Me]=t.createFramebuffer()}else D.__webglFramebuffer[ie]=t.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){D.__webglFramebuffer=[];for(let ie=0;ie<x.mipmaps.length;ie++)D.__webglFramebuffer[ie]=t.createFramebuffer()}else D.__webglFramebuffer=t.createFramebuffer();if(Ie)for(let ie=0,Me=j.length;ie<Me;ie++){let Re=i.get(j[ie]);Re.__webglTexture===void 0&&(Re.__webglTexture=t.createTexture(),o.memory.textures++)}if(R.samples>0&&Ke(R)===!1){D.__webglMultisampledFramebuffer=t.createFramebuffer(),D.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let ie=0;ie<j.length;ie++){let Me=j[ie];D.__webglColorRenderbuffer[ie]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,D.__webglColorRenderbuffer[ie]);let Re=s.convert(Me.format,Me.colorSpace),Z=s.convert(Me.type),de=T(Me.internalFormat,Re,Z,Me.colorSpace,R.isXRRenderTarget===!0),Fe=_e(R);t.renderbufferStorageMultisample(t.RENDERBUFFER,Fe,de,R.width,R.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ie,t.RENDERBUFFER,D.__webglColorRenderbuffer[ie])}t.bindRenderbuffer(t.RENDERBUFFER,null),R.depthBuffer&&(D.__webglDepthRenderbuffer=t.createRenderbuffer(),ce(D.__webglDepthRenderbuffer,R,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(W){n.bindTexture(t.TEXTURE_CUBE_MAP,X.__webglTexture),qe(t.TEXTURE_CUBE_MAP,x);for(let ie=0;ie<6;ie++)if(x.mipmaps&&x.mipmaps.length>0)for(let Me=0;Me<x.mipmaps.length;Me++)Te(D.__webglFramebuffer[ie][Me],R,x,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Me);else Te(D.__webglFramebuffer[ie],R,x,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0);m(x)&&p(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Ie){for(let ie=0,Me=j.length;ie<Me;ie++){let Re=j[ie],Z=i.get(Re);n.bindTexture(t.TEXTURE_2D,Z.__webglTexture),qe(t.TEXTURE_2D,Re),Te(D.__webglFramebuffer,R,Re,t.COLOR_ATTACHMENT0+ie,t.TEXTURE_2D,0),m(Re)&&p(t.TEXTURE_2D)}n.unbindTexture()}else{let ie=t.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ie=R.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(ie,X.__webglTexture),qe(ie,x),x.mipmaps&&x.mipmaps.length>0)for(let Me=0;Me<x.mipmaps.length;Me++)Te(D.__webglFramebuffer[Me],R,x,t.COLOR_ATTACHMENT0,ie,Me);else Te(D.__webglFramebuffer,R,x,t.COLOR_ATTACHMENT0,ie,0);m(x)&&p(ie),n.unbindTexture()}R.depthBuffer&&at(R)}function I(R){let x=R.textures;for(let D=0,X=x.length;D<X;D++){let j=x[D];if(m(j)){let W=E(R),Ie=i.get(j).__webglTexture;n.bindTexture(W,Ie),p(W),n.unbindTexture()}}}let At=[],$e=[];function Je(R){if(R.samples>0){if(Ke(R)===!1){let x=R.textures,D=R.width,X=R.height,j=t.COLOR_BUFFER_BIT,W=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Ie=i.get(R),ie=x.length>1;if(ie)for(let Re=0;Re<x.length;Re++)n.bindFramebuffer(t.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,Ie.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer);let Me=R.texture.mipmaps;Me&&Me.length>0?n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer[0]):n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let Re=0;Re<x.length;Re++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=t.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=t.STENCIL_BUFFER_BIT)),ie){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Ie.__webglColorRenderbuffer[Re]);let Z=i.get(x[Re]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Z,0)}t.blitFramebuffer(0,0,D,X,0,0,D,X,j,t.NEAREST),l===!0&&(At.length=0,$e.length=0,At.push(t.COLOR_ATTACHMENT0+Re),R.depthBuffer&&R.resolveDepthBuffer===!1&&(At.push(W),$e.push(W),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,$e)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,At))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),ie)for(let Re=0;Re<x.length;Re++){n.bindFramebuffer(t.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.RENDERBUFFER,Ie.__webglColorRenderbuffer[Re]);let Z=i.get(x[Re]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,Ie.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.TEXTURE_2D,Z,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let x=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[x])}}}function _e(R){return Math.min(r.maxSamples,R.samples)}function Ke(R){let x=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Ae(R){let x=o.render.frame;u.get(R)!==x&&(u.set(R,x),R.update())}function ke(R,x){let D=R.colorSpace,X=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||D!==hn&&D!==yr&&(nt.getTransfer(D)===Mt?(X!==Yn||j!==Ci)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",D)),x}function Ft(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=F,this.setTexture2D=$,this.setTexture2DArray=z,this.setTexture3D=J,this.setTextureCube=V,this.rebindTextures=pt,this.setupRenderTarget=Ze,this.updateRenderTargetMipmap=I,this.updateMultisampleRenderTarget=Je,this.setupDepthRenderbuffer=at,this.setupFrameBufferTexture=Te,this.useMultisampledRTT=Ke}function aA(t,e){function n(i,r=yr){let s,o=nt.getTransfer(r);if(i===Ci)return t.UNSIGNED_BYTE;if(i===mu)return t.UNSIGNED_SHORT_4_4_4_4;if(i===gu)return t.UNSIGNED_SHORT_5_5_5_1;if(i===Uf)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Pf)return t.BYTE;if(i===Lf)return t.SHORT;if(i===Do)return t.UNSIGNED_SHORT;if(i===pu)return t.INT;if(i===Xr)return t.UNSIGNED_INT;if(i===oi)return t.FLOAT;if(i===Oo)return t.HALF_FLOAT;if(i===Nf)return t.ALPHA;if(i===Df)return t.RGB;if(i===Yn)return t.RGBA;if(i===Mo)return t.DEPTH_COMPONENT;if(i===Bo)return t.DEPTH_STENCIL;if(i===_u)return t.RED;if(i===vu)return t.RED_INTEGER;if(i===Of)return t.RG;if(i===xu)return t.RG_INTEGER;if(i===yu)return t.RGBA_INTEGER;if(i===gl||i===_l||i===vl||i===xl)if(o===Mt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===gl)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===_l)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===vl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===xl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===gl)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===_l)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===vl)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===xl)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Mu||i===Eu||i===Su||i===Tu)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Mu)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Eu)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Su)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Tu)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===bu||i===wu||i===Au)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===bu||i===wu)return o===Mt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Au)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Ru||i===Cu||i===Iu||i===Pu||i===Lu||i===Uu||i===Nu||i===Du||i===Ou||i===Fu||i===Bu||i===ku||i===Hu||i===Vu)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Ru)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Cu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Iu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Pu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Lu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Uu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Nu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Du)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ou)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Fu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Bu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ku)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Hu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Vu)return o===Mt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===yl||i===zu||i===Gu)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===yl)return o===Mt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===zu)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Gu)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ff||i===Wu||i===Xu||i===qu)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===yl)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Wu)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Xu)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===qu)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Fo?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}var lA=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cA=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,op=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){let r=new an,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!==i.depthNear||n.depthFar!==i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let n=e.cameras[0].viewport,i=new qn({vertexShader:lA,fragmentShader:cA,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new jt(new sl(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ap=class extends dr{constructor(e,n){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null,_=new op,m=n.getContextAttributes(),p=null,E=null,T=[],v=[],C=new Ye,A=null,b=new $t;b.viewport=new ut;let P=new $t;P.viewport=new ut;let S=[b,P],y=new iu,L=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ne=T[q];return ne===void 0&&(ne=new bo,T[q]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(q){let ne=T[q];return ne===void 0&&(ne=new bo,T[q]=ne),ne.getGripSpace()},this.getHand=function(q){let ne=T[q];return ne===void 0&&(ne=new bo,T[q]=ne),ne.getHandSpace()};function B(q){let ne=v.indexOf(q.inputSource);if(ne===-1)return;let ye=T[ne];ye!==void 0&&(ye.update(q.inputSource,q.frame,c||o),ye.dispatchEvent({type:q.type,data:q.inputSource}))}function G(){r.removeEventListener("select",B),r.removeEventListener("selectstart",B),r.removeEventListener("selectend",B),r.removeEventListener("squeeze",B),r.removeEventListener("squeezestart",B),r.removeEventListener("squeezeend",B),r.removeEventListener("end",G),r.removeEventListener("inputsourceschange",$);for(let q=0;q<T.length;q++){let ne=v[q];ne!==null&&(v[q]=null,T[q].disconnect(ne))}L=null,F=null,_.reset(),e.setRenderTarget(p),f=null,d=null,h=null,r=null,E=null,ot.stop(),i.isPresenting=!1,e.setPixelRatio(A),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",B),r.addEventListener("selectstart",B),r.addEventListener("selectend",B),r.addEventListener("squeeze",B),r.addEventListener("squeezestart",B),r.addEventListener("squeezeend",B),r.addEventListener("end",G),r.addEventListener("inputsourceschange",$),m.xrCompatible!==!0&&await n.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(C),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let ye=null,ae=null,Te=null;m.depth&&(Te=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,ye=m.stencil?Bo:Mo,ae=m.stencil?Fo:Xr);let ce={colorFormat:n.RGBA8,depthFormat:Te,scaleFactor:s};h=new XRWebGLBinding(r,n),d=h.createProjectionLayer(ce),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),E=new ki(d.textureWidth,d.textureHeight,{format:Yn,type:Ci,depthTexture:new rl(d.textureWidth,d.textureHeight,ae,void 0,void 0,void 0,void 0,void 0,void 0,ye),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let ye={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,n,ye),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),E=new ki(f.framebufferWidth,f.framebufferHeight,{format:Yn,type:Ci,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),ot.setContext(r),ot.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function $(q){for(let ne=0;ne<q.removed.length;ne++){let ye=q.removed[ne],ae=v.indexOf(ye);ae>=0&&(v[ae]=null,T[ae].disconnect(ye))}for(let ne=0;ne<q.added.length;ne++){let ye=q.added[ne],ae=v.indexOf(ye);if(ae===-1){for(let ce=0;ce<T.length;ce++)if(ce>=v.length){v.push(ye),ae=ce;break}else if(v[ce]===null){v[ce]=ye,ae=ce;break}if(ae===-1)break}let Te=T[ae];Te&&Te.connect(ye)}}let z=new w,J=new w;function V(q,ne,ye){z.setFromMatrixPosition(ne.matrixWorld),J.setFromMatrixPosition(ye.matrixWorld);let ae=z.distanceTo(J),Te=ne.projectionMatrix.elements,ce=ye.projectionMatrix.elements,fe=Te[14]/(Te[10]-1),at=Te[14]/(Te[10]+1),pt=(Te[9]+1)/Te[5],Ze=(Te[9]-1)/Te[5],I=(Te[8]-1)/Te[0],At=(ce[8]+1)/ce[0],$e=fe*I,Je=fe*At,_e=ae/(-I+At),Ke=_e*-I;if(ne.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Ke),q.translateZ(_e),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Te[10]===-1)q.projectionMatrix.copy(ne.projectionMatrix),q.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{let Ae=fe+_e,ke=at+_e,Ft=$e-Ke,R=Je+(ae-Ke),x=pt*at/ke*Ae,D=Ze*at/ke*Ae;q.projectionMatrix.makePerspective(Ft,R,x,D,Ae,ke),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function re(q,ne){ne===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(ne.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let ne=q.near,ye=q.far;_.texture!==null&&(_.depthNear>0&&(ne=_.depthNear),_.depthFar>0&&(ye=_.depthFar)),y.near=P.near=b.near=ne,y.far=P.far=b.far=ye,(L!==y.near||F!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),L=y.near,F=y.far),b.layers.mask=q.layers.mask|2,P.layers.mask=q.layers.mask|4,y.layers.mask=b.layers.mask|P.layers.mask;let ae=q.parent,Te=y.cameras;re(y,ae);for(let ce=0;ce<Te.length;ce++)re(Te[ce],ae);Te.length===2?V(y,b,P):y.projectionMatrix.copy(b.projectionMatrix),te(q,y,ae)};function te(q,ne,ye){ye===null?q.matrix.copy(ne.matrixWorld):(q.matrix.copy(ye.matrixWorld),q.matrix.invert(),q.matrix.multiply(ne.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ne.projectionMatrix),q.projectionMatrixInverse.copy(ne.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Ts*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(y)};let we=null;function qe(q,ne){if(u=ne.getViewerPose(c||o),g=ne,u!==null){let ye=u.views;f!==null&&(e.setRenderTargetFramebuffer(E,f.framebuffer),e.setRenderTarget(E));let ae=!1;ye.length!==y.cameras.length&&(y.cameras.length=0,ae=!0);for(let fe=0;fe<ye.length;fe++){let at=ye[fe],pt=null;if(f!==null)pt=f.getViewport(at);else{let I=h.getViewSubImage(d,at);pt=I.viewport,fe===0&&(e.setRenderTargetTextures(E,I.colorTexture,I.depthStencilTexture),e.setRenderTarget(E))}let Ze=S[fe];Ze===void 0&&(Ze=new $t,Ze.layers.enable(fe),Ze.viewport=new ut,S[fe]=Ze),Ze.matrix.fromArray(at.transform.matrix),Ze.matrix.decompose(Ze.position,Ze.quaternion,Ze.scale),Ze.projectionMatrix.fromArray(at.projectionMatrix),Ze.projectionMatrixInverse.copy(Ze.projectionMatrix).invert(),Ze.viewport.set(pt.x,pt.y,pt.width,pt.height),fe===0&&(y.matrix.copy(Ze.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ae===!0&&y.cameras.push(Ze)}let Te=r.enabledFeatures;if(Te&&Te.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&h){let fe=h.getDepthInformation(ye[0]);fe&&fe.isValid&&fe.texture&&_.init(e,fe,r.renderState)}}for(let ye=0;ye<T.length;ye++){let ae=v[ye],Te=T[ye];ae!==null&&Te!==void 0&&Te.update(ae,ne,c||o)}we&&we(q,ne),ne.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ne}),g=null}let ot=new gv;ot.setAnimationLoop(qe),this.setAnimationLoop=function(q){we=q},this.dispose=function(){}}},Fs=new ln,uA=new be;function hA(t,e){function n(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Wf(t)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,E,T,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),h(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,E,T):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,n(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,n(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,n(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===dn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,n(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===dn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,n(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,n(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,n(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let E=e.get(p),T=E.envMap,v=E.envMapRotation;T&&(m.envMap.value=T,Fs.copy(v),Fs.x*=-1,Fs.y*=-1,Fs.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Fs.y*=-1,Fs.z*=-1),m.envMapRotation.value.setFromMatrix4(uA.makeRotationFromEuler(Fs)),m.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,n(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,n(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,n(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,E,T){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=T*.5,p.map&&(m.map.value=p.map,n(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,n(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,n(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,n(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,n(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,n(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,n(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,n(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,n(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,n(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,n(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===dn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,n(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,n(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,n(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,n(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,n(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,n(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,n(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function dA(t,e,n,i){let r={},s={},o=[],a=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(E,T){let v=T.program;i.uniformBlockBinding(E,v)}function c(E,T){let v=r[E.id];v===void 0&&(g(E),v=u(E),r[E.id]=v,E.addEventListener("dispose",m));let C=T.program;i.updateUBOMapping(E,C);let A=e.render.frame;s[E.id]!==A&&(d(E),s[E.id]=A)}function u(E){let T=h();E.__bindingPointIndex=T;let v=t.createBuffer(),C=E.__size,A=E.usage;return t.bindBuffer(t.UNIFORM_BUFFER,v),t.bufferData(t.UNIFORM_BUFFER,C,A),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,T,v),v}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){let T=r[E.id],v=E.uniforms,C=E.__cache;t.bindBuffer(t.UNIFORM_BUFFER,T);for(let A=0,b=v.length;A<b;A++){let P=Array.isArray(v[A])?v[A]:[v[A]];for(let S=0,y=P.length;S<y;S++){let L=P[S];if(f(L,A,S,C)===!0){let F=L.__offset,B=Array.isArray(L.value)?L.value:[L.value],G=0;for(let $=0;$<B.length;$++){let z=B[$],J=_(z);typeof z=="number"||typeof z=="boolean"?(L.__data[0]=z,t.bufferSubData(t.UNIFORM_BUFFER,F+G,L.__data)):z.isMatrix3?(L.__data[0]=z.elements[0],L.__data[1]=z.elements[1],L.__data[2]=z.elements[2],L.__data[3]=0,L.__data[4]=z.elements[3],L.__data[5]=z.elements[4],L.__data[6]=z.elements[5],L.__data[7]=0,L.__data[8]=z.elements[6],L.__data[9]=z.elements[7],L.__data[10]=z.elements[8],L.__data[11]=0):(z.toArray(L.__data,G),G+=J.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,F,L.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function f(E,T,v,C){let A=E.value,b=T+"_"+v;if(C[b]===void 0)return typeof A=="number"||typeof A=="boolean"?C[b]=A:C[b]=A.clone(),!0;{let P=C[b];if(typeof A=="number"||typeof A=="boolean"){if(P!==A)return C[b]=A,!0}else if(P.equals(A)===!1)return P.copy(A),!0}return!1}function g(E){let T=E.uniforms,v=0,C=16;for(let b=0,P=T.length;b<P;b++){let S=Array.isArray(T[b])?T[b]:[T[b]];for(let y=0,L=S.length;y<L;y++){let F=S[y],B=Array.isArray(F.value)?F.value:[F.value];for(let G=0,$=B.length;G<$;G++){let z=B[G],J=_(z),V=v%C,re=V%J.boundary,te=V+re;v+=re,te!==0&&C-te<J.storage&&(v+=C-te),F.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=v,v+=J.storage}}}let A=v%C;return A>0&&(v+=C-A),E.__size=v,E.__cache={},this}function _(E){let T={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(T.boundary=4,T.storage=4):E.isVector2?(T.boundary=8,T.storage=8):E.isVector3||E.isColor?(T.boundary=16,T.storage=12):E.isVector4?(T.boundary=16,T.storage=16):E.isMatrix3?(T.boundary=48,T.storage=48):E.isMatrix4?(T.boundary=64,T.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),T}function m(E){let T=E.target;T.removeEventListener("dispose",m);let v=o.indexOf(T.__bindingPointIndex);o.splice(v,1),t.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function p(){for(let E in r)t.deleteBuffer(r[E]);o=[],r={},s={}}return{bind:l,update:c,dispose:p}}var Ju=class{constructor(e={}){let{canvas:n=H_(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;let g=new Uint32Array(4),_=new Int32Array(4),m=null,p=null,E=[],T=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=xr,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let v=this,C=!1;this._outputColorSpace=Qt;let A=0,b=0,P=null,S=-1,y=null,L=new ut,F=new ut,B=null,G=new xe(0),$=0,z=n.width,J=n.height,V=1,re=null,te=null,we=new ut(0,0,z,J),qe=new ut(0,0,z,J),ot=!1,q=new Co,ne=!1,ye=!1,ae=new be,Te=new be,ce=new w,fe=new ut,at={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},pt=!1;function Ze(){return P===null?V:1}let I=i;function At(M,N){return n.getContext(M,N)}try{let M={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Ai}`),n.addEventListener("webglcontextlost",me,!1),n.addEventListener("webglcontextrestored",Q,!1),n.addEventListener("webglcontextcreationerror",Y,!1),I===null){let N="webgl2";if(I=At(N,M),I===null)throw At(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let $e,Je,_e,Ke,Ae,ke,Ft,R,x,D,X,j,W,Ie,ie,Me,Re,Z,de,Fe,Oe,oe,Ve,U;function le(){$e=new Ib(I),$e.init(),oe=new aA(I,$e),Je=new Sb(I,$e,e,oe),_e=new sA(I,$e),Je.reverseDepthBuffer&&d&&_e.buffers.depth.setReversed(!0),Ke=new Ub(I),Ae=new qw,ke=new oA(I,$e,_e,Ae,Je,oe,Ke),Ft=new bb(v),R=new Cb(v),x=new kS(I),Ve=new Mb(I,x),D=new Pb(I,x,Ke,Ve),X=new Db(I,D,x,Ke),de=new Nb(I,Je,ke),Me=new Tb(Ae),j=new Xw(v,Ft,R,$e,Je,Ve,Me),W=new hA(v,Ae),Ie=new $w,ie=new eA($e),Z=new yb(v,Ft,R,_e,X,f,l),Re=new iA(v,X,Je),U=new dA(I,Ke,Je,_e),Fe=new Eb(I,$e,Ke),Oe=new Lb(I,$e,Ke),Ke.programs=j.programs,v.capabilities=Je,v.extensions=$e,v.properties=Ae,v.renderLists=Ie,v.shadowMap=Re,v.state=_e,v.info=Ke}le();let K=new ap(v,I);this.xr=K,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let M=$e.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=$e.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(M){M!==void 0&&(V=M,this.setSize(z,J,!1))},this.getSize=function(M){return M.set(z,J)},this.setSize=function(M,N,k=!0){if(K.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=M,J=N,n.width=Math.floor(M*V),n.height=Math.floor(N*V),k===!0&&(n.style.width=M+"px",n.style.height=N+"px"),this.setViewport(0,0,M,N)},this.getDrawingBufferSize=function(M){return M.set(z*V,J*V).floor()},this.setDrawingBufferSize=function(M,N,k){z=M,J=N,V=k,n.width=Math.floor(M*k),n.height=Math.floor(N*k),this.setViewport(0,0,M,N)},this.getCurrentViewport=function(M){return M.copy(L)},this.getViewport=function(M){return M.copy(we)},this.setViewport=function(M,N,k,H){M.isVector4?we.set(M.x,M.y,M.z,M.w):we.set(M,N,k,H),_e.viewport(L.copy(we).multiplyScalar(V).round())},this.getScissor=function(M){return M.copy(qe)},this.setScissor=function(M,N,k,H){M.isVector4?qe.set(M.x,M.y,M.z,M.w):qe.set(M,N,k,H),_e.scissor(F.copy(qe).multiplyScalar(V).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(M){_e.setScissorTest(ot=M)},this.setOpaqueSort=function(M){re=M},this.setTransparentSort=function(M){te=M},this.getClearColor=function(M){return M.copy(Z.getClearColor())},this.setClearColor=function(){Z.setClearColor(...arguments)},this.getClearAlpha=function(){return Z.getClearAlpha()},this.setClearAlpha=function(){Z.setClearAlpha(...arguments)},this.clear=function(M=!0,N=!0,k=!0){let H=0;if(M){let O=!1;if(P!==null){let ee=P.texture.format;O=ee===yu||ee===xu||ee===vu}if(O){let ee=P.texture.type,ue=ee===Ci||ee===Xr||ee===Do||ee===Fo||ee===mu||ee===gu,Ee=Z.getClearColor(),ge=Z.getClearAlpha(),ze=Ee.r,Xe=Ee.g,De=Ee.b;ue?(g[0]=ze,g[1]=Xe,g[2]=De,g[3]=ge,I.clearBufferuiv(I.COLOR,0,g)):(_[0]=ze,_[1]=Xe,_[2]=De,_[3]=ge,I.clearBufferiv(I.COLOR,0,_))}else H|=I.COLOR_BUFFER_BIT}N&&(H|=I.DEPTH_BUFFER_BIT),k&&(H|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",me,!1),n.removeEventListener("webglcontextrestored",Q,!1),n.removeEventListener("webglcontextcreationerror",Y,!1),Z.dispose(),Ie.dispose(),ie.dispose(),Ae.dispose(),Ft.dispose(),R.dispose(),X.dispose(),Ve.dispose(),U.dispose(),j.dispose(),K.dispose(),K.removeEventListener("sessionstart",Pa),K.removeEventListener("sessionend",uc),rr.stop()};function me(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function Q(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;let M=Ke.autoReset,N=Re.enabled,k=Re.autoUpdate,H=Re.needsUpdate,O=Re.type;le(),Ke.autoReset=M,Re.enabled=N,Re.autoUpdate=k,Re.needsUpdate=H,Re.type=O}function Y(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function ve(M){let N=M.target;N.removeEventListener("dispose",ve),We(N)}function We(M){xt(M),Ae.remove(M)}function xt(M){let N=Ae.get(M).programs;N!==void 0&&(N.forEach(function(k){j.releaseProgram(k)}),M.isShaderMaterial&&j.releaseShaderCache(M))}this.renderBufferDirect=function(M,N,k,H,O,ee){N===null&&(N=at);let ue=O.isMesh&&O.matrixWorld.determinant()<0,Ee=Nd(M,N,k,H,O);_e.setMaterial(H,ue);let ge=k.index,ze=1;if(H.wireframe===!0){if(ge=D.getWireframeAttribute(k),ge===void 0)return;ze=2}let Xe=k.drawRange,De=k.attributes.position,tt=Xe.start*ze,St=(Xe.start+Xe.count)*ze;ee!==null&&(tt=Math.max(tt,ee.start*ze),St=Math.min(St,(ee.start+ee.count)*ze)),ge!==null?(tt=Math.max(tt,0),St=Math.min(St,ge.count)):De!=null&&(tt=Math.max(tt,0),St=Math.min(St,De.count));let zt=St-tt;if(zt<0||zt===1/0)return;Ve.setup(O,H,Ee,k,ge);let It,Tt=Fe;if(ge!==null&&(It=x.get(ge),Tt=Oe,Tt.setIndex(It)),O.isMesh)H.wireframe===!0?(_e.setLineWidth(H.wireframeLinewidth*Ze()),Tt.setMode(I.LINES)):Tt.setMode(I.TRIANGLES);else if(O.isLine){let Be=H.linewidth;Be===void 0&&(Be=1),_e.setLineWidth(Be*Ze()),O.isLineSegments?Tt.setMode(I.LINES):O.isLineLoop?Tt.setMode(I.LINE_LOOP):Tt.setMode(I.LINE_STRIP)}else O.isPoints?Tt.setMode(I.POINTS):O.isSprite&&Tt.setMode(I.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)bs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Tt.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if($e.get("WEBGL_multi_draw"))Tt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{let Be=O._multiDrawStarts,Bt=O._multiDrawCounts,ct=O._multiDrawCount,Vn=ge?x.get(ge).bytesPerElement:1,io=Ae.get(H).currentProgram.getUniforms();for(let zn=0;zn<ct;zn++)io.setValue(I,"_gl_DrawID",zn),Tt.render(Be[zn]/Vn,Bt[zn])}else if(O.isInstancedMesh)Tt.renderInstances(tt,zt,O.count);else if(k.isInstancedBufferGeometry){let Be=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,Bt=Math.min(k.instanceCount,Be);Tt.renderInstances(tt,zt,Bt)}else Tt.render(tt,zt)};function mt(M,N,k){M.transparent===!0&&M.side===Sn&&M.forceSinglePass===!1?(M.side=dn,M.needsUpdate=!0,to(M,N,k),M.side=bi,M.needsUpdate=!0,to(M,N,k),M.side=Sn):to(M,N,k)}this.compile=function(M,N,k=null){k===null&&(k=M),p=ie.get(k),p.init(N),T.push(p),k.traverseVisible(function(O){O.isLight&&O.layers.test(N.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),M!==k&&M.traverseVisible(function(O){O.isLight&&O.layers.test(N.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();let H=new Set;return M.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;let ee=O.material;if(ee)if(Array.isArray(ee))for(let ue=0;ue<ee.length;ue++){let Ee=ee[ue];mt(Ee,k,O),H.add(Ee)}else mt(ee,k,O),H.add(ee)}),p=T.pop(),H},this.compileAsync=function(M,N,k=null){let H=this.compile(M,N,k);return new Promise(O=>{function ee(){if(H.forEach(function(ue){Ae.get(ue).currentProgram.isReady()&&H.delete(ue)}),H.size===0){O(M);return}setTimeout(ee,10)}$e.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let Hn=null;function xi(M){Hn&&Hn(M)}function Pa(){rr.stop()}function uc(){rr.start()}let rr=new gv;rr.setAnimationLoop(xi),typeof self<"u"&&rr.setContext(self),this.setAnimationLoop=function(M){Hn=M,K.setAnimationLoop(M),M===null?rr.stop():rr.start()},K.addEventListener("sessionstart",Pa),K.addEventListener("sessionend",uc),this.render=function(M,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),K.enabled===!0&&K.isPresenting===!0&&(K.cameraAutoUpdate===!0&&K.updateCamera(N),N=K.getCamera()),M.isScene===!0&&M.onBeforeRender(v,M,N,P),p=ie.get(M,T.length),p.init(N),T.push(p),Te.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),q.setFromProjectionMatrix(Te),ye=this.localClippingEnabled,ne=Me.init(this.clippingPlanes,ye),m=Ie.get(M,E.length),m.init(),E.push(m),K.enabled===!0&&K.isPresenting===!0){let ee=v.xr.getDepthSensingMesh();ee!==null&&La(ee,N,-1/0,v.sortObjects)}La(M,N,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(re,te),pt=K.enabled===!1||K.isPresenting===!1||K.hasDepthSensing()===!1,pt&&Z.addToRenderList(m,M),this.info.render.frame++,ne===!0&&Me.beginShadows();let k=p.state.shadowsArray;Re.render(k,M,N),ne===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset();let H=m.opaque,O=m.transmissive;if(p.setupLights(),N.isArrayCamera){let ee=N.cameras;if(O.length>0)for(let ue=0,Ee=ee.length;ue<Ee;ue++){let ge=ee[ue];dc(H,O,M,ge)}pt&&Z.render(M);for(let ue=0,Ee=ee.length;ue<Ee;ue++){let ge=ee[ue];hc(m,M,ge,ge.viewport)}}else O.length>0&&dc(H,O,M,N),pt&&Z.render(M),hc(m,M,N);P!==null&&b===0&&(ke.updateMultisampleRenderTarget(P),ke.updateRenderTargetMipmap(P)),M.isScene===!0&&M.onAfterRender(v,M,N),Ve.resetDefaultState(),S=-1,y=null,T.pop(),T.length>0?(p=T[T.length-1],ne===!0&&Me.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function La(M,N,k,H){if(M.visible===!1)return;if(M.layers.test(N.layers)){if(M.isGroup)k=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(N);else if(M.isLight)p.pushLight(M),M.castShadow&&p.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||q.intersectsSprite(M)){H&&fe.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Te);let ue=X.update(M),Ee=M.material;Ee.visible&&m.push(M,ue,Ee,k,fe.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||q.intersectsObject(M))){let ue=X.update(M),Ee=M.material;if(H&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),fe.copy(M.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),fe.copy(ue.boundingSphere.center)),fe.applyMatrix4(M.matrixWorld).applyMatrix4(Te)),Array.isArray(Ee)){let ge=ue.groups;for(let ze=0,Xe=ge.length;ze<Xe;ze++){let De=ge[ze],tt=Ee[De.materialIndex];tt&&tt.visible&&m.push(M,ue,tt,k,fe.z,De)}}else Ee.visible&&m.push(M,ue,Ee,k,fe.z,null)}}let ee=M.children;for(let ue=0,Ee=ee.length;ue<Ee;ue++)La(ee[ue],N,k,H)}function hc(M,N,k,H){let O=M.opaque,ee=M.transmissive,ue=M.transparent;p.setupLightsView(k),ne===!0&&Me.setGlobalState(v.clippingPlanes,k),H&&_e.viewport(L.copy(H)),O.length>0&&Nr(O,N,k),ee.length>0&&Nr(ee,N,k),ue.length>0&&Nr(ue,N,k),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function dc(M,N,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new ki(1,1,{generateMipmaps:!0,type:$e.has("EXT_color_buffer_half_float")||$e.has("EXT_color_buffer_float")?Oo:Ci,minFilter:Ri,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace}));let ee=p.state.transmissionRenderTarget[H.id],ue=H.viewport||L;ee.setSize(ue.z*v.transmissionResolutionScale,ue.w*v.transmissionResolutionScale);let Ee=v.getRenderTarget(),ge=v.getActiveCubeFace(),ze=v.getActiveMipmapLevel();v.setRenderTarget(ee),v.getClearColor(G),$=v.getClearAlpha(),$<1&&v.setClearColor(16777215,.5),v.clear(),pt&&Z.render(k);let Xe=v.toneMapping;v.toneMapping=xr;let De=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),ne===!0&&Me.setGlobalState(v.clippingPlanes,H),Nr(M,k,H),ke.updateMultisampleRenderTarget(ee),ke.updateRenderTargetMipmap(ee),$e.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let St=0,zt=N.length;St<zt;St++){let It=N[St],Tt=It.object,Be=It.geometry,Bt=It.material,ct=It.group;if(Bt.side===Sn&&Tt.layers.test(H.layers)){let Vn=Bt.side;Bt.side=dn,Bt.needsUpdate=!0,Ua(Tt,k,H,Be,Bt,ct),Bt.side=Vn,Bt.needsUpdate=!0,tt=!0}}tt===!0&&(ke.updateMultisampleRenderTarget(ee),ke.updateRenderTargetMipmap(ee))}v.setRenderTarget(Ee,ge,ze),v.setClearColor(G,$),De!==void 0&&(H.viewport=De),v.toneMapping=Xe}function Nr(M,N,k){let H=N.isScene===!0?N.overrideMaterial:null;for(let O=0,ee=M.length;O<ee;O++){let ue=M[O],Ee=ue.object,ge=ue.geometry,ze=ue.group,Xe=ue.material;Xe.allowOverride===!0&&H!==null&&(Xe=H),Ee.layers.test(k.layers)&&Ua(Ee,N,k,ge,Xe,ze)}}function Ua(M,N,k,H,O,ee){M.onBeforeRender(v,N,k,H,O,ee),M.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),O.onBeforeRender(v,N,k,H,M,ee),O.transparent===!0&&O.side===Sn&&O.forceSinglePass===!1?(O.side=dn,O.needsUpdate=!0,v.renderBufferDirect(k,N,H,O,M,ee),O.side=bi,O.needsUpdate=!0,v.renderBufferDirect(k,N,H,O,M,ee),O.side=Sn):v.renderBufferDirect(k,N,H,O,M,ee),M.onAfterRender(v,N,k,H,O,ee)}function to(M,N,k){N.isScene!==!0&&(N=at);let H=Ae.get(M),O=p.state.lights,ee=p.state.shadowsArray,ue=O.state.version,Ee=j.getParameters(M,O.state,ee,N,k),ge=j.getProgramCacheKey(Ee),ze=H.programs;H.environment=M.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(M.isMeshStandardMaterial?R:Ft).get(M.envMap||H.environment),H.envMapRotation=H.environment!==null&&M.envMap===null?N.environmentRotation:M.envMapRotation,ze===void 0&&(M.addEventListener("dispose",ve),ze=new Map,H.programs=ze);let Xe=ze.get(ge);if(Xe!==void 0){if(H.currentProgram===Xe&&H.lightsStateVersion===ue)return Ud(M,Ee),Xe}else Ee.uniforms=j.getUniforms(M),M.onBeforeCompile(Ee,v),Xe=j.acquireProgram(Ee,ge),ze.set(ge,Xe),H.uniforms=Ee.uniforms;let De=H.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(De.clippingPlanes=Me.uniform),Ud(M,Ee),H.needsLights=Dd(M),H.lightsStateVersion=ue,H.needsLights&&(De.ambientLightColor.value=O.state.ambient,De.lightProbe.value=O.state.probe,De.directionalLights.value=O.state.directional,De.directionalLightShadows.value=O.state.directionalShadow,De.spotLights.value=O.state.spot,De.spotLightShadows.value=O.state.spotShadow,De.rectAreaLights.value=O.state.rectArea,De.ltc_1.value=O.state.rectAreaLTC1,De.ltc_2.value=O.state.rectAreaLTC2,De.pointLights.value=O.state.point,De.pointLightShadows.value=O.state.pointShadow,De.hemisphereLights.value=O.state.hemi,De.directionalShadowMap.value=O.state.directionalShadowMap,De.directionalShadowMatrix.value=O.state.directionalShadowMatrix,De.spotShadowMap.value=O.state.spotShadowMap,De.spotLightMatrix.value=O.state.spotLightMatrix,De.spotLightMap.value=O.state.spotLightMap,De.pointShadowMap.value=O.state.pointShadowMap,De.pointShadowMatrix.value=O.state.pointShadowMatrix),H.currentProgram=Xe,H.uniformsList=null,Xe}function fc(M){if(M.uniformsList===null){let N=M.currentProgram.getUniforms();M.uniformsList=zo.seqWithValue(N.seq,M.uniforms)}return M.uniformsList}function Ud(M,N){let k=Ae.get(M);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.batchingColor=N.batchingColor,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.instancingMorph=N.instancingMorph,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function Nd(M,N,k,H,O){N.isScene!==!0&&(N=at),ke.resetTextureUnits();let ee=N.fog,ue=H.isMeshStandardMaterial?N.environment:null,Ee=P===null?v.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:hn,ge=(H.isMeshStandardMaterial?R:Ft).get(H.envMap||ue),ze=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Xe=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),De=!!k.morphAttributes.position,tt=!!k.morphAttributes.normal,St=!!k.morphAttributes.color,zt=xr;H.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(zt=v.toneMapping);let It=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Tt=It!==void 0?It.length:0,Be=Ae.get(H),Bt=p.state.lights;if(ne===!0&&(ye===!0||M!==y)){let vn=M===y&&H.id===S;Me.setState(H,M,vn)}let ct=!1;H.version===Be.__version?(Be.needsLights&&Be.lightsStateVersion!==Bt.state.version||Be.outputColorSpace!==Ee||O.isBatchedMesh&&Be.batching===!1||!O.isBatchedMesh&&Be.batching===!0||O.isBatchedMesh&&Be.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Be.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Be.instancing===!1||!O.isInstancedMesh&&Be.instancing===!0||O.isSkinnedMesh&&Be.skinning===!1||!O.isSkinnedMesh&&Be.skinning===!0||O.isInstancedMesh&&Be.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Be.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Be.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Be.instancingMorph===!1&&O.morphTexture!==null||Be.envMap!==ge||H.fog===!0&&Be.fog!==ee||Be.numClippingPlanes!==void 0&&(Be.numClippingPlanes!==Me.numPlanes||Be.numIntersection!==Me.numIntersection)||Be.vertexAlphas!==ze||Be.vertexTangents!==Xe||Be.morphTargets!==De||Be.morphNormals!==tt||Be.morphColors!==St||Be.toneMapping!==zt||Be.morphTargetsCount!==Tt)&&(ct=!0):(ct=!0,Be.__version=H.version);let Vn=Be.currentProgram;ct===!0&&(Vn=to(H,N,O));let io=!1,zn=!1,Na=!1,Lt=Vn.getUniforms(),ni=Be.uniforms;if(_e.useProgram(Vn.program)&&(io=!0,zn=!0,Na=!0),H.id!==S&&(S=H.id,zn=!0),io||y!==M){_e.buffers.depth.getReversed()?(ae.copy(M.projectionMatrix),z_(ae),G_(ae),Lt.setValue(I,"projectionMatrix",ae)):Lt.setValue(I,"projectionMatrix",M.projectionMatrix),Lt.setValue(I,"viewMatrix",M.matrixWorldInverse);let In=Lt.map.cameraPosition;In!==void 0&&In.setValue(I,ce.setFromMatrixPosition(M.matrixWorld)),Je.logarithmicDepthBuffer&&Lt.setValue(I,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Lt.setValue(I,"isOrthographic",M.isOrthographicCamera===!0),y!==M&&(y=M,zn=!0,Na=!0)}if(O.isSkinnedMesh){Lt.setOptional(I,O,"bindMatrix"),Lt.setOptional(I,O,"bindMatrixInverse");let vn=O.skeleton;vn&&(vn.boneTexture===null&&vn.computeBoneTexture(),Lt.setValue(I,"boneTexture",vn.boneTexture,ke))}O.isBatchedMesh&&(Lt.setOptional(I,O,"batchingTexture"),Lt.setValue(I,"batchingTexture",O._matricesTexture,ke),Lt.setOptional(I,O,"batchingIdTexture"),Lt.setValue(I,"batchingIdTexture",O._indirectTexture,ke),Lt.setOptional(I,O,"batchingColorTexture"),O._colorsTexture!==null&&Lt.setValue(I,"batchingColorTexture",O._colorsTexture,ke));let ii=k.morphAttributes;if((ii.position!==void 0||ii.normal!==void 0||ii.color!==void 0)&&de.update(O,k,Vn),(zn||Be.receiveShadow!==O.receiveShadow)&&(Be.receiveShadow=O.receiveShadow,Lt.setValue(I,"receiveShadow",O.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(ni.envMap.value=ge,ni.flipEnvMap.value=ge.isCubeTexture&&ge.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&N.environment!==null&&(ni.envMapIntensity.value=N.environmentIntensity),zn&&(Lt.setValue(I,"toneMappingExposure",v.toneMappingExposure),Be.needsLights&&pc(ni,Na),ee&&H.fog===!0&&W.refreshFogUniforms(ni,ee),W.refreshMaterialUniforms(ni,H,V,J,p.state.transmissionRenderTarget[M.id]),zo.upload(I,fc(Be),ni,ke)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(zo.upload(I,fc(Be),ni,ke),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Lt.setValue(I,"center",O.center),Lt.setValue(I,"modelViewMatrix",O.modelViewMatrix),Lt.setValue(I,"normalMatrix",O.normalMatrix),Lt.setValue(I,"modelMatrix",O.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let vn=H.uniformsGroups;for(let In=0,Bd=vn.length;In<Bd;In++){let ps=vn[In];U.update(ps,Vn),U.bind(ps,Vn)}}return Vn}function pc(M,N){M.ambientLightColor.needsUpdate=N,M.lightProbe.needsUpdate=N,M.directionalLights.needsUpdate=N,M.directionalLightShadows.needsUpdate=N,M.pointLights.needsUpdate=N,M.pointLightShadows.needsUpdate=N,M.spotLights.needsUpdate=N,M.spotLightShadows.needsUpdate=N,M.rectAreaLights.needsUpdate=N,M.hemisphereLights.needsUpdate=N}function Dd(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(M,N,k){let H=Ae.get(M);H.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),Ae.get(M.texture).__webglTexture=N,Ae.get(M.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:k,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,N){let k=Ae.get(M);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0};let Od=I.createFramebuffer();this.setRenderTarget=function(M,N=0,k=0){P=M,A=N,b=k;let H=!0,O=null,ee=!1,ue=!1;if(M){let ge=Ae.get(M);if(ge.__useDefaultFramebuffer!==void 0)_e.bindFramebuffer(I.FRAMEBUFFER,null),H=!1;else if(ge.__webglFramebuffer===void 0)ke.setupRenderTarget(M);else if(ge.__hasExternalTextures)ke.rebindTextures(M,Ae.get(M.texture).__webglTexture,Ae.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let De=M.depthTexture;if(ge.__boundDepthTexture!==De){if(De!==null&&Ae.has(De)&&(M.width!==De.image.width||M.height!==De.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ke.setupDepthRenderbuffer(M)}}let ze=M.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(ue=!0);let Xe=Ae.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Xe[N])?O=Xe[N][k]:O=Xe[N],ee=!0):M.samples>0&&ke.useMultisampledRTT(M)===!1?O=Ae.get(M).__webglMultisampledFramebuffer:Array.isArray(Xe)?O=Xe[k]:O=Xe,L.copy(M.viewport),F.copy(M.scissor),B=M.scissorTest}else L.copy(we).multiplyScalar(V).floor(),F.copy(qe).multiplyScalar(V).floor(),B=ot;if(k!==0&&(O=Od),_e.bindFramebuffer(I.FRAMEBUFFER,O)&&H&&_e.drawBuffers(M,O),_e.viewport(L),_e.scissor(F),_e.setScissorTest(B),ee){let ge=Ae.get(M.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+N,ge.__webglTexture,k)}else if(ue){let ge=Ae.get(M.texture),ze=N;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,ge.__webglTexture,k,ze)}else if(M!==null&&k!==0){let ge=Ae.get(M.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ge.__webglTexture,k)}S=-1},this.readRenderTargetPixels=function(M,N,k,H,O,ee,ue,Ee=0){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ge=Ae.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ue!==void 0&&(ge=ge[ue]),ge){_e.bindFramebuffer(I.FRAMEBUFFER,ge);try{let ze=M.textures[Ee],Xe=ze.format,De=ze.type;if(!Je.textureFormatReadable(Xe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Je.textureTypeReadable(De)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=M.width-H&&k>=0&&k<=M.height-O&&(M.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+Ee),I.readPixels(N,k,H,O,oe.convert(Xe),oe.convert(De),ee))}finally{let ze=P!==null?Ae.get(P).__webglFramebuffer:null;_e.bindFramebuffer(I.FRAMEBUFFER,ze)}}},this.readRenderTargetPixelsAsync=async function(M,N,k,H,O,ee,ue,Ee=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ge=Ae.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ue!==void 0&&(ge=ge[ue]),ge)if(N>=0&&N<=M.width-H&&k>=0&&k<=M.height-O){_e.bindFramebuffer(I.FRAMEBUFFER,ge);let ze=M.textures[Ee],Xe=ze.format,De=ze.type;if(!Je.textureFormatReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Je.textureTypeReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let tt=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,tt),I.bufferData(I.PIXEL_PACK_BUFFER,ee.byteLength,I.STREAM_READ),M.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+Ee),I.readPixels(N,k,H,O,oe.convert(Xe),oe.convert(De),0);let St=P!==null?Ae.get(P).__webglFramebuffer:null;_e.bindFramebuffer(I.FRAMEBUFFER,St);let zt=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await V_(I,zt,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,tt),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,ee),I.deleteBuffer(tt),I.deleteSync(zt),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,N=null,k=0){let H=Math.pow(2,-k),O=Math.floor(M.image.width*H),ee=Math.floor(M.image.height*H),ue=N!==null?N.x:0,Ee=N!==null?N.y:0;ke.setTexture2D(M,0),I.copyTexSubImage2D(I.TEXTURE_2D,k,0,0,ue,Ee,O,ee),_e.unbindTexture()};let no=I.createFramebuffer(),Fd=I.createFramebuffer();this.copyTextureToTexture=function(M,N,k=null,H=null,O=0,ee=null){ee===null&&(O!==0?(bs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ee=O,O=0):ee=0);let ue,Ee,ge,ze,Xe,De,tt,St,zt,It=M.isCompressedTexture?M.mipmaps[ee]:M.image;if(k!==null)ue=k.max.x-k.min.x,Ee=k.max.y-k.min.y,ge=k.isBox3?k.max.z-k.min.z:1,ze=k.min.x,Xe=k.min.y,De=k.isBox3?k.min.z:0;else{let ii=Math.pow(2,-O);ue=Math.floor(It.width*ii),Ee=Math.floor(It.height*ii),M.isDataArrayTexture?ge=It.depth:M.isData3DTexture?ge=Math.floor(It.depth*ii):ge=1,ze=0,Xe=0,De=0}H!==null?(tt=H.x,St=H.y,zt=H.z):(tt=0,St=0,zt=0);let Tt=oe.convert(N.format),Be=oe.convert(N.type),Bt;N.isData3DTexture?(ke.setTexture3D(N,0),Bt=I.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(ke.setTexture2DArray(N,0),Bt=I.TEXTURE_2D_ARRAY):(ke.setTexture2D(N,0),Bt=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,N.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,N.unpackAlignment);let ct=I.getParameter(I.UNPACK_ROW_LENGTH),Vn=I.getParameter(I.UNPACK_IMAGE_HEIGHT),io=I.getParameter(I.UNPACK_SKIP_PIXELS),zn=I.getParameter(I.UNPACK_SKIP_ROWS),Na=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,It.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,It.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,ze),I.pixelStorei(I.UNPACK_SKIP_ROWS,Xe),I.pixelStorei(I.UNPACK_SKIP_IMAGES,De);let Lt=M.isDataArrayTexture||M.isData3DTexture,ni=N.isDataArrayTexture||N.isData3DTexture;if(M.isDepthTexture){let ii=Ae.get(M),vn=Ae.get(N),In=Ae.get(ii.__renderTarget),Bd=Ae.get(vn.__renderTarget);_e.bindFramebuffer(I.READ_FRAMEBUFFER,In.__webglFramebuffer),_e.bindFramebuffer(I.DRAW_FRAMEBUFFER,Bd.__webglFramebuffer);for(let ps=0;ps<ge;ps++)Lt&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ae.get(M).__webglTexture,O,De+ps),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ae.get(N).__webglTexture,ee,zt+ps)),I.blitFramebuffer(ze,Xe,ue,Ee,tt,St,ue,Ee,I.DEPTH_BUFFER_BIT,I.NEAREST);_e.bindFramebuffer(I.READ_FRAMEBUFFER,null),_e.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(O!==0||M.isRenderTargetTexture||Ae.has(M)){let ii=Ae.get(M),vn=Ae.get(N);_e.bindFramebuffer(I.READ_FRAMEBUFFER,no),_e.bindFramebuffer(I.DRAW_FRAMEBUFFER,Fd);for(let In=0;In<ge;In++)Lt?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,ii.__webglTexture,O,De+In):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ii.__webglTexture,O),ni?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,vn.__webglTexture,ee,zt+In):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,vn.__webglTexture,ee),O!==0?I.blitFramebuffer(ze,Xe,ue,Ee,tt,St,ue,Ee,I.COLOR_BUFFER_BIT,I.NEAREST):ni?I.copyTexSubImage3D(Bt,ee,tt,St,zt+In,ze,Xe,ue,Ee):I.copyTexSubImage2D(Bt,ee,tt,St,ze,Xe,ue,Ee);_e.bindFramebuffer(I.READ_FRAMEBUFFER,null),_e.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else ni?M.isDataTexture||M.isData3DTexture?I.texSubImage3D(Bt,ee,tt,St,zt,ue,Ee,ge,Tt,Be,It.data):N.isCompressedArrayTexture?I.compressedTexSubImage3D(Bt,ee,tt,St,zt,ue,Ee,ge,Tt,It.data):I.texSubImage3D(Bt,ee,tt,St,zt,ue,Ee,ge,Tt,Be,It):M.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,ee,tt,St,ue,Ee,Tt,Be,It.data):M.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,ee,tt,St,It.width,It.height,Tt,It.data):I.texSubImage2D(I.TEXTURE_2D,ee,tt,St,ue,Ee,Tt,Be,It);I.pixelStorei(I.UNPACK_ROW_LENGTH,ct),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Vn),I.pixelStorei(I.UNPACK_SKIP_PIXELS,io),I.pixelStorei(I.UNPACK_SKIP_ROWS,zn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Na),ee===0&&N.generateMipmaps&&I.generateMipmap(Bt),_e.unbindTexture()},this.copyTextureToTexture3D=function(M,N,k=null,H=null,O=0){return bs('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,N,k,H,O)},this.initRenderTarget=function(M){Ae.get(M).__webglFramebuffer===void 0&&ke.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?ke.setTextureCube(M,0):M.isData3DTexture?ke.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?ke.setTexture2DArray(M,0):ke.setTexture2D(M,0),_e.unbindTexture()},this.resetState=function(){A=0,b=0,P=null,_e.reset(),Ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let n=this.getContext();n.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),n.unpackColorSpace=nt._getUnpackColorSpace()}};function cp(t,e){if(e===Bf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),t;if(e===ko||e===Ml){let n=t.getIndex();if(n===null){let o=[],a=t.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);t.setIndex(o),n=t.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),t}let i=n.count-2,r=[];if(e===ko)for(let o=1;o<=i;o++)r.push(n.getX(0)),r.push(n.getX(o)),r.push(n.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(r.push(n.getX(o)),r.push(n.getX(o+1)),r.push(n.getX(o+2))):(r.push(n.getX(o+2)),r.push(n.getX(o+1)),r.push(n.getX(o)));r.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let s=t.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),t}var eh=class extends Gi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(n){return new gp(n)}),this.register(function(n){return new _p(n)}),this.register(function(n){return new wp(n)}),this.register(function(n){return new Ap(n)}),this.register(function(n){return new Rp(n)}),this.register(function(n){return new xp(n)}),this.register(function(n){return new yp(n)}),this.register(function(n){return new Mp(n)}),this.register(function(n){return new Ep(n)}),this.register(function(n){return new mp(n)}),this.register(function(n){return new Sp(n)}),this.register(function(n){return new vp(n)}),this.register(function(n){return new bp(n)}),this.register(function(n){return new Tp(n)}),this.register(function(n){return new fp(n)}),this.register(function(n){return new Cp(n)}),this.register(function(n){return new Ip(n)})}load(e,n,i,r){let s=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=_r.extractUrlBase(e);o=_r.resolveURL(c,this.path)}else o=_r.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){r?r(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new Po(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,o,function(u){n(u),s.manager.itemEnd(e)},a)}catch(u){a(u)}},i,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,n,i,r){let s,o={},a={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===bv){try{o[et.KHR_BINARY_GLTF]=new Pp(e)}catch(h){r&&r(h);return}s=JSON.parse(o[et.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new Bp(s,{path:n||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){let h=s.extensionsUsed[u],d=s.extensionsRequired||[];switch(h){case et.KHR_MATERIALS_UNLIT:o[h]=new pp;break;case et.KHR_DRACO_MESH_COMPRESSION:o[h]=new Lp(s,this.dracoLoader);break;case et.KHR_TEXTURE_TRANSFORM:o[h]=new Up;break;case et.KHR_MESH_QUANTIZATION:o[h]=new Np;break;default:d.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(i,r)}parseAsync(e,n){let i=this;return new Promise(function(r,s){i.parse(e,n,r,s)})}};function fA(){let t={};return{get:function(e){return t[e]},add:function(e,n){t[e]=n},remove:function(e){delete t[e]},removeAll:function(){t={}}}}var et={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},fp=class{constructor(e){this.parser=e,this.name=et.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,n=this.parser.json.nodes||[];for(let i=0,r=n.length;i<r;i++){let s=n[i];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let n=this.parser,i="light:"+e,r=n.cache.get(i);if(r)return r;let s=n.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],c,u=new xe(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],hn);let h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Ps(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new hl(u),c.distance=h;break;case"spot":c=new ul(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Mr(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=n.createUniqueName(l.name||"light_"+e),r=Promise.resolve(c),n.cache.add(i,r),r}getDependency(e,n){if(e==="light")return this._loadLight(n)}createNodeAttachment(e){let n=this,i=this.parser,s=i.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return i._getNodeRef(n.cache,a,l)})}},pp=class{constructor(){this.name=et.KHR_MATERIALS_UNLIT}getMaterialType(){return Ln}extendParams(e,n,i){let r=[];e.color=new xe(1,1,1),e.opacity=1;let s=n.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let o=s.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],hn),e.opacity=o[3]}s.baseColorTexture!==void 0&&r.push(i.assignTexture(e,"map",s.baseColorTexture,Qt))}return Promise.all(r)}},mp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,n){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name].emissiveStrength;return s!==void 0&&(n.emissiveIntensity=s),Promise.resolve()}},gp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];if(o.clearcoatFactor!==void 0&&(n.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&s.push(i.assignTexture(n,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(n.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&s.push(i.assignTexture(n,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(s.push(i.assignTexture(n,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;n.clearcoatNormalScale=new Ye(a,a)}return Promise.all(s)}},_p=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_DISPERSION}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name];return n.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}},vp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];return o.iridescenceFactor!==void 0&&(n.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&s.push(i.assignTexture(n,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(n.iridescenceIOR=o.iridescenceIor),n.iridescenceThicknessRange===void 0&&(n.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&s.push(i.assignTexture(n,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(s)}},xp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_SHEEN}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[];n.sheenColor=new xe(0,0,0),n.sheenRoughness=0,n.sheen=1;let o=r.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;n.sheenColor.setRGB(a[0],a[1],a[2],hn)}return o.sheenRoughnessFactor!==void 0&&(n.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&s.push(i.assignTexture(n,"sheenColorMap",o.sheenColorTexture,Qt)),o.sheenRoughnessTexture!==void 0&&s.push(i.assignTexture(n,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(s)}},yp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];return o.transmissionFactor!==void 0&&(n.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&s.push(i.assignTexture(n,"transmissionMap",o.transmissionTexture)),Promise.all(s)}},Mp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_VOLUME}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];n.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&s.push(i.assignTexture(n,"thicknessMap",o.thicknessTexture)),n.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return n.attenuationColor=new xe().setRGB(a[0],a[1],a[2],hn),Promise.all(s)}},Ep=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_IOR}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=r.extensions[this.name];return n.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}},Sp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_SPECULAR}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];n.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&s.push(i.assignTexture(n,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return n.specularColor=new xe().setRGB(a[0],a[1],a[2],hn),o.specularColorTexture!==void 0&&s.push(i.assignTexture(n,"specularColorMap",o.specularColorTexture,Qt)),Promise.all(s)}},Tp=class{constructor(e){this.parser=e,this.name=et.EXT_MATERIALS_BUMP}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];return n.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&s.push(i.assignTexture(n,"bumpMap",o.bumpTexture)),Promise.all(s)}},bp=class{constructor(e){this.parser=e,this.name=et.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Un}extendMaterialParams(e,n){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let s=[],o=r.extensions[this.name];return o.anisotropyStrength!==void 0&&(n.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(n.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&s.push(i.assignTexture(n,"anisotropyMap",o.anisotropyTexture)),Promise.all(s)}},wp=class{constructor(e){this.parser=e,this.name=et.KHR_TEXTURE_BASISU}loadTexture(e){let n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let s=r.extensions[this.name],o=n.options.ktx2Loader;if(!o){if(i.extensionsRequired&&i.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return n.loadTextureImage(e,s.source,o)}},Ap=class{constructor(e){this.parser=e,this.name=et.EXT_TEXTURE_WEBP}loadTexture(e){let n=this.name,i=this.parser,r=i.json,s=r.textures[e];if(!s.extensions||!s.extensions[n])return null;let o=s.extensions[n],a=r.images[o.source],l=i.textureLoader;if(a.uri){let c=i.options.manager.getHandler(a.uri);c!==null&&(l=c)}return i.loadTextureImage(e,o.source,l)}},Rp=class{constructor(e){this.parser=e,this.name=et.EXT_TEXTURE_AVIF}loadTexture(e){let n=this.name,i=this.parser,r=i.json,s=r.textures[e];if(!s.extensions||!s.extensions[n])return null;let o=s.extensions[n],a=r.images[o.source],l=i.textureLoader;if(a.uri){let c=i.options.manager.getHandler(a.uri);c!==null&&(l=c)}return i.loadTextureImage(e,o.source,l)}},Cp=class{constructor(e){this.name=et.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let n=this.parser.json,i=n.bufferViews[e];if(i.extensions&&i.extensions[this.name]){let r=i.extensions[this.name],s=this.parser.getDependency("buffer",r.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(a){let l=r.byteOffset||0,c=r.byteLength||0,u=r.count,h=r.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,d,r.mode,r.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(f),u,h,d,r.mode,r.filter),f})})}else return null}},Ip=class{constructor(e){this.name=et.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let n=this.parser.json,i=n.nodes[e];if(!i.extensions||!i.extensions[this.name]||i.mesh===void 0)return null;let r=n.meshes[i.mesh];for(let c of r.primitives)if(c.mode!==ai.TRIANGLES&&c.mode!==ai.TRIANGLE_STRIP&&c.mode!==ai.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=i.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let u=c.pop(),h=u.isGroup?u.children:[u],d=c[0].count,f=[];for(let g of h){let _=new be,m=new w,p=new he,E=new w(1,1,1),T=new tl(g.geometry,g.material,d);for(let v=0;v<d;v++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&E.fromBufferAttribute(l.SCALE,v),T.setMatrixAt(v,_.compose(m,p,E));for(let v in l)if(v==="_COLOR_0"){let C=l[v];T.instanceColor=new Wr(C.array,C.itemSize,C.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,l[v]);_t.prototype.copy.call(T,g),this.parser.assignFinalMaterial(T),f.push(T)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},bv="glTF",Tl=12,Mv={JSON:1313821514,BIN:5130562},Pp=class{constructor(e){this.name=et.KHR_BINARY_GLTF,this.content=null,this.body=null;let n=new DataView(e,0,Tl),i=new TextDecoder;if(this.header={magic:i.decode(new Uint8Array(e.slice(0,4))),version:n.getUint32(4,!0),length:n.getUint32(8,!0)},this.header.magic!==bv)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let r=this.header.length-Tl,s=new DataView(e,Tl),o=0;for(;o<r;){let a=s.getUint32(o,!0);o+=4;let l=s.getUint32(o,!0);if(o+=4,l===Mv.JSON){let c=new Uint8Array(e,Tl+o,a);this.content=i.decode(c)}else if(l===Mv.BIN){let c=Tl+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Lp=class{constructor(e,n){if(!n)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=et.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=n,this.dracoLoader.preload()}decodePrimitive(e,n){let i=this.json,r=this.dracoLoader,s=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let u in o){let h=Op[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=Op[u]||u.toLowerCase();if(o[u]!==void 0){let d=i.accessors[e.attributes[u]],f=Wo[d.componentType];c[h]=f.name,l[h]=d.normalized===!0}}return n.getDependency("bufferView",s).then(function(u){return new Promise(function(h,d){r.decodeDracoFile(u,function(f){for(let g in f.attributes){let _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}h(f)},a,c,hn,d)})})}},Up=class{constructor(){this.name=et.KHR_TEXTURE_TRANSFORM}extendTexture(e,n){return(n.texCoord===void 0||n.texCoord===e.channel)&&n.offset===void 0&&n.rotation===void 0&&n.scale===void 0||(e=e.clone(),n.texCoord!==void 0&&(e.channel=n.texCoord),n.offset!==void 0&&e.offset.fromArray(n.offset),n.rotation!==void 0&&(e.rotation=n.rotation),n.scale!==void 0&&e.repeat.fromArray(n.scale),e.needsUpdate=!0),e}},Np=class{constructor(){this.name=et.KHR_MESH_QUANTIZATION}},th=class extends pr{constructor(e,n,i,r){super(e,n,i,r)}copySampleValue_(e){let n=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r*3+r;for(let o=0;o!==r;o++)n[o]=i[s+o];return n}interpolate_(e,n,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=r-n,h=(i-n)/u,d=h*h,f=d*h,g=e*c,_=g-c,m=-2*f+3*d,p=f-d,E=1-m,T=p-d+h;for(let v=0;v!==a;v++){let C=o[_+v+a],A=o[_+v+l]*u,b=o[g+v+a],P=o[g+v]*u;s[v]=E*C+T*A+m*b+p*P}return s}},pA=new he,Dp=class extends th{interpolate_(e,n,i,r){let s=super.interpolate_(e,n,i,r);return pA.fromArray(s).normalize().toArray(s),s}},ai={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Wo={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Ev={9728:un,9729:Mn,9984:fu,9985:No,9986:Ns,9987:Ri},Sv={33071:Oi,33648:yo,10497:Gr},up={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Op={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},qr={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},mA={CUBICSPLINE:void 0,LINEAR:Ss,STEP:Es},hp={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function gA(t){return t.DefaultMaterial===void 0&&(t.DefaultMaterial=new Rs({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:bi})),t.DefaultMaterial}function Hs(t,e,n){for(let i in n.extensions)t[i]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[i]=n.extensions[i])}function Mr(t,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(t.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function _A(t,e,n){let i=!1,r=!1,s=!1;for(let c=0,u=e.length;c<u;c++){let h=e[c];if(h.POSITION!==void 0&&(i=!0),h.NORMAL!==void 0&&(r=!0),h.COLOR_0!==void 0&&(s=!0),i&&r&&s)break}if(!i&&!r&&!s)return Promise.resolve(t);let o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){let h=e[c];if(i){let d=h.POSITION!==void 0?n.getDependency("accessor",h.POSITION):t.attributes.position;o.push(d)}if(r){let d=h.NORMAL!==void 0?n.getDependency("accessor",h.NORMAL):t.attributes.normal;a.push(d)}if(s){let d=h.COLOR_0!==void 0?n.getDependency("accessor",h.COLOR_0):t.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let u=c[0],h=c[1],d=c[2];return i&&(t.morphAttributes.position=u),r&&(t.morphAttributes.normal=h),s&&(t.morphAttributes.color=d),t.morphTargetsRelative=!0,t})}function vA(t,e){if(t.updateMorphTargets(),e.weights!==void 0)for(let n=0,i=e.weights.length;n<i;n++)t.morphTargetInfluences[n]=e.weights[n];if(e.extras&&Array.isArray(e.extras.targetNames)){let n=e.extras.targetNames;if(t.morphTargetInfluences.length===n.length){t.morphTargetDictionary={};for(let i=0,r=n.length;i<r;i++)t.morphTargetDictionary[n[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function xA(t){let e,n=t.extensions&&t.extensions[et.KHR_DRACO_MESH_COMPRESSION];if(n?e="draco:"+n.bufferView+":"+n.indices+":"+dp(n.attributes):e=t.indices+":"+dp(t.attributes)+":"+t.mode,t.targets!==void 0)for(let i=0,r=t.targets.length;i<r;i++)e+=":"+dp(t.targets[i]);return e}function dp(t){let e="",n=Object.keys(t).sort();for(let i=0,r=n.length;i<r;i++)e+=n[i]+":"+t[n[i]]+";";return e}function Fp(t){switch(t){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function yA(t){return t.search(/\.jpe?g($|\?)/i)>0||t.search(/^data\:image\/jpeg/)===0?"image/jpeg":t.search(/\.webp($|\?)/i)>0||t.search(/^data\:image\/webp/)===0?"image/webp":t.search(/\.ktx2($|\?)/i)>0||t.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var MA=new be,Bp=class{constructor(e={},n={}){this.json=e,this.extensions={},this.plugins={},this.options=n,this.cache=new fA,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let i=!1,r=-1,s=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;i=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);r=i&&l?parseInt(l[1],10):-1,s=a.indexOf("Firefox")>-1,o=s?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||i&&r<17||s&&o<98?this.textureLoader=new ll(this.options.manager):this.textureLoader=new fl(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Po(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,n){let i=this,r=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([i.getDependencies("scene"),i.getDependencies("animation"),i.getDependencies("camera")])}).then(function(o){let a={scene:o[0][r.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:r.asset,parser:i,userData:{}};return Hs(s,a,r),Mr(a,r),Promise.all(i._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(n)}_markDefs(){let e=this.json.nodes||[],n=this.json.skins||[],i=this.json.meshes||[];for(let r=0,s=n.length;r<s;r++){let o=n[r].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let r=0,s=e.length;r<s;r++){let o=e[r];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(i[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,n){n!==void 0&&(e.refs[n]===void 0&&(e.refs[n]=e.uses[n]=0),e.refs[n]++)}_getNodeRef(e,n,i){if(e.refs[n]<=1)return i;let r=i.clone(),s=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,u]of o.children.entries())s(u,a.children[c])};return s(i,r),r.name+="_instance_"+e.uses[n]++,r}_invokeOne(e){let n=Object.values(this.plugins);n.push(this);for(let i=0;i<n.length;i++){let r=e(n[i]);if(r)return r}return null}_invokeAll(e){let n=Object.values(this.plugins);n.unshift(this);let i=[];for(let r=0;r<n.length;r++){let s=e(n[r]);s&&i.push(s)}return i}getDependency(e,n){let i=e+":"+n,r=this.cache.get(i);if(!r){switch(e){case"scene":r=this.loadScene(n);break;case"node":r=this._invokeOne(function(s){return s.loadNode&&s.loadNode(n)});break;case"mesh":r=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(n)});break;case"accessor":r=this.loadAccessor(n);break;case"bufferView":r=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(n)});break;case"buffer":r=this.loadBuffer(n);break;case"material":r=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(n)});break;case"texture":r=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(n)});break;case"skin":r=this.loadSkin(n);break;case"animation":r=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(n)});break;case"camera":r=this.loadCamera(n);break;default:if(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,n)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(i,r)}return r}getDependencies(e){let n=this.cache.get(e);if(!n){let i=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];n=Promise.all(r.map(function(s,o){return i.getDependency(e,o)})),this.cache.add(e,n)}return n}loadBuffer(e){let n=this.json.buffers[e],i=this.fileLoader;if(n.type&&n.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+n.type+" buffer type is not supported.");if(n.uri===void 0&&e===0)return Promise.resolve(this.extensions[et.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(s,o){i.load(_r.resolveURL(n.uri,r.path),s,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+n.uri+'".'))})})}loadBufferView(e){let n=this.json.bufferViews[e];return this.getDependency("buffer",n.buffer).then(function(i){let r=n.byteLength||0,s=n.byteOffset||0;return i.slice(s,s+r)})}loadAccessor(e){let n=this,i=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let o=up[r.type],a=Wo[r.componentType],l=r.normalized===!0,c=new a(r.count*o);return Promise.resolve(new Ge(c,o,l))}let s=[];return r.bufferView!==void 0?s.push(this.getDependency("bufferView",r.bufferView)):s.push(null),r.sparse!==void 0&&(s.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(s).then(function(o){let a=o[0],l=up[r.type],c=Wo[r.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,d=r.byteOffset||0,f=r.bufferView!==void 0?i.bufferViews[r.bufferView].byteStride:void 0,g=r.normalized===!0,_,m;if(f&&f!==h){let p=Math.floor(d/f),E="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+p+":"+r.count,T=n.cache.get(E);T||(_=new c(a,p*f,r.count*f/u),T=new wo(_,f/u),n.cache.add(E,T)),m=new Ao(T,l,d%f/u,g)}else a===null?_=new c(r.count*l):_=new c(a,d,r.count*l),m=new Ge(_,l,g);if(r.sparse!==void 0){let p=up.SCALAR,E=Wo[r.sparse.indices.componentType],T=r.sparse.indices.byteOffset||0,v=r.sparse.values.byteOffset||0,C=new E(o[1],T,r.sparse.count*p),A=new c(o[2],v,r.sparse.count*l);a!==null&&(m=new Ge(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let b=0,P=C.length;b<P;b++){let S=C[b];if(m.setX(S,A[b*l]),l>=2&&m.setY(S,A[b*l+1]),l>=3&&m.setZ(S,A[b*l+2]),l>=4&&m.setW(S,A[b*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let n=this.json,i=this.options,s=n.textures[e].source,o=n.images[s],a=this.textureLoader;if(o.uri){let l=i.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,s,a)}loadTextureImage(e,n,i){let r=this,s=this.json,o=s.textures[e],a=s.images[n],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(n,i).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let d=(s.samplers||{})[o.sampler]||{};return u.magFilter=Ev[d.magFilter]||Mn,u.minFilter=Ev[d.minFilter]||Ri,u.wrapS=Sv[d.wrapS]||Gr,u.wrapT=Sv[d.wrapT]||Gr,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==un&&u.minFilter!==Mn,r.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,n){let i=this,r=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=r.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=i.getDependency("bufferView",o.bufferView).then(function(h){c=!0;let d=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(l).then(function(h){return new Promise(function(d,f){let g=d;n.isImageBitmapLoader===!0&&(g=function(_){let m=new an(_);m.needsUpdate=!0,d(m)}),n.load(_r.resolveURL(h,s.path),g,void 0,f)})}).then(function(h){return c===!0&&a.revokeObjectURL(l),Mr(h,o),h.userData.mimeType=o.mimeType||yA(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,n,i,r){let s=this;return this.getDependency("texture",i.index).then(function(o){if(!o)return null;if(i.texCoord!==void 0&&i.texCoord>0&&(o=o.clone(),o.channel=i.texCoord),s.extensions[et.KHR_TEXTURE_TRANSFORM]){let a=i.extensions!==void 0?i.extensions[et.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=s.associations.get(o);o=s.extensions[et.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),s.associations.set(o,l)}}return r!==void 0&&(o.colorSpace=r),e[n]=o,o})}assignFinalMaterial(e){let n=e.geometry,i=e.material,r=n.attributes.tangent===void 0,s=n.attributes.color!==void 0,o=n.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+i.uuid,l=this.cache.get(a);l||(l=new Io,mn.prototype.copy.call(l,i),l.color.copy(i.color),l.map=i.map,l.sizeAttenuation=!1,this.cache.add(a,l)),i=l}else if(e.isLine){let a="LineBasicMaterial:"+i.uuid,l=this.cache.get(a);l||(l=new En,mn.prototype.copy.call(l,i),l.color.copy(i.color),l.map=i.map,this.cache.add(a,l)),i=l}if(r||s||o){let a="ClonedMaterial:"+i.uuid+":";r&&(a+="derivative-tangents:"),s&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=i.clone(),s&&(l.vertexColors=!0),o&&(l.flatShading=!0),r&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(i))),i=l}e.material=i}getMaterialType(){return Rs}loadMaterial(e){let n=this,i=this.json,r=this.extensions,s=i.materials[e],o,a={},l=s.extensions||{},c=[];if(l[et.KHR_MATERIALS_UNLIT]){let h=r[et.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),c.push(h.extendParams(a,s,n))}else{let h=s.pbrMetallicRoughness||{};if(a.color=new xe(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let d=h.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],hn),a.opacity=d[3]}h.baseColorTexture!==void 0&&c.push(n.assignTexture(a,"map",h.baseColorTexture,Qt)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(n.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),c.push(n.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}s.doubleSided===!0&&(a.side=Sn);let u=s.alphaMode||hp.OPAQUE;if(u===hp.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===hp.MASK&&(a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&o!==Ln&&(c.push(n.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new Ye(1,1),s.normalTexture.scale!==void 0)){let h=s.normalTexture.scale;a.normalScale.set(h,h)}if(s.occlusionTexture!==void 0&&o!==Ln&&(c.push(n.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&o!==Ln){let h=s.emissiveFactor;a.emissive=new xe().setRGB(h[0],h[1],h[2],hn)}return s.emissiveTexture!==void 0&&o!==Ln&&c.push(n.assignTexture(a,"emissiveMap",s.emissiveTexture,Qt)),Promise.all(c).then(function(){let h=new o(a);return s.name&&(h.name=s.name),Mr(h,s),n.associations.set(h,{materials:e}),s.extensions&&Hs(r,h,s),h})}createUniqueName(e){let n=bt.sanitizeNodeName(e||"");return n in this.nodeNamesUsed?n+"_"+ ++this.nodeNamesUsed[n]:(this.nodeNamesUsed[n]=0,n)}loadGeometries(e){let n=this,i=this.extensions,r=this.primitiveCache;function s(a){return i[et.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,n).then(function(l){return Tv(l,a,n)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],u=xA(c),h=r[u];if(h)o.push(h.promise);else{let d;c.extensions&&c.extensions[et.KHR_DRACO_MESH_COMPRESSION]?d=s(c):d=Tv(new ht,c,n),r[u]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let n=this,i=this.json,r=this.extensions,s=i.meshes[e],o=s.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let u=o[l].material===void 0?gA(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(n.loadGeometries(o)),Promise.all(a).then(function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let f=0,g=u.length;f<g;f++){let _=u[f],m=o[f],p,E=c[f];if(m.mode===ai.TRIANGLES||m.mode===ai.TRIANGLE_STRIP||m.mode===ai.TRIANGLE_FAN||m.mode===void 0)p=s.isSkinnedMesh===!0?new As(_,E):new jt(_,E),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===ai.TRIANGLE_STRIP?p.geometry=cp(p.geometry,Ml):m.mode===ai.TRIANGLE_FAN&&(p.geometry=cp(p.geometry,ko));else if(m.mode===ai.LINES)p=new si(_,E);else if(m.mode===ai.LINE_STRIP)p=new fr(_,E);else if(m.mode===ai.LINE_LOOP)p=new nl(_,E);else if(m.mode===ai.POINTS)p=new il(_,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&vA(p,s),p.name=n.createUniqueName(s.name||"mesh_"+e),Mr(p,s),m.extensions&&Hs(r,p,m),n.assignFinalMaterial(p),h.push(p)}for(let f=0,g=h.length;f<g;f++)n.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return s.extensions&&Hs(r,h[0],s),h[0];let d=new kt;s.extensions&&Hs(r,d,s),n.associations.set(d,{meshes:e});for(let f=0,g=h.length;f<g;f++)d.add(h[f]);return d})}loadCamera(e){let n,i=this.json.cameras[e],r=i[i.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return i.type==="perspective"?n=new $t(gt.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):i.type==="orthographic"&&(n=new Is(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),i.name&&(n.name=this.createUniqueName(i.name)),Mr(n,i),Promise.resolve(n)}loadSkin(e){let n=this.json.skins[e],i=[];for(let r=0,s=n.joints.length;r<s;r++)i.push(this._loadNodeShallow(n.joints[r]));return n.inverseBindMatrices!==void 0?i.push(this.getDependency("accessor",n.inverseBindMatrices)):i.push(null),Promise.all(i).then(function(r){let s=r.pop(),o=r,a=[],l=[];for(let c=0,u=o.length;c<u;c++){let h=o[c];if(h){a.push(h);let d=new be;s!==null&&d.fromArray(s.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',n.joints[c])}return new wi(a,l)})}loadAnimation(e){let n=this.json,i=this,r=n.animations[e],s=r.name?r.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let h=0,d=r.channels.length;h<d;h++){let f=r.channels[h],g=r.samplers[f.sampler],_=f.target,m=_.node,p=r.parameters!==void 0?r.parameters[g.input]:g.input,E=r.parameters!==void 0?r.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",E)),c.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){let d=h[0],f=h[1],g=h[2],_=h[3],m=h[4],p=[];for(let E=0,T=d.length;E<T;E++){let v=d[E],C=f[E],A=g[E],b=_[E],P=m[E];if(v===void 0)continue;v.updateMatrix&&v.updateMatrix();let S=i._createAnimationTracks(v,C,A,b,P);if(S)for(let y=0;y<S.length;y++)p.push(S[y])}return new al(s,void 0,p)})}createNodeMesh(e){let n=this.json,i=this,r=n.nodes[e];return r.mesh===void 0?null:i.getDependency("mesh",r.mesh).then(function(s){let o=i._getNodeRef(i.meshCache,r.mesh,s);return r.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=r.weights.length;l<c;l++)a.morphTargetInfluences[l]=r.weights[l]}),o})}loadNode(e){let n=this.json,i=this,r=n.nodes[e],s=i._loadNodeShallow(e),o=[],a=r.children||[];for(let c=0,u=a.length;c<u;c++)o.push(i.getDependency("node",a[c]));let l=r.skin===void 0?Promise.resolve(null):i.getDependency("skin",r.skin);return Promise.all([s,Promise.all(o),l]).then(function(c){let u=c[0],h=c[1],d=c[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,MA)});for(let f=0,g=h.length;f<g;f++)u.add(h[f]);return u})}_loadNodeShallow(e){let n=this.json,i=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=n.nodes[e],o=s.name?r.createUniqueName(s.name):"",a=[],l=r._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),s.camera!==void 0&&a.push(r.getDependency("camera",s.camera).then(function(c){return r._getNodeRef(r.cameraCache,s.camera,c)})),r._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(s.isBone===!0?u=new Ro:c.length>1?u=new kt:c.length===1?u=c[0]:u=new _t,u!==c[0])for(let h=0,d=c.length;h<d;h++)u.add(c[h]);if(s.name&&(u.userData.name=s.name,u.name=o),Mr(u,s),s.extensions&&Hs(i,u,s),s.matrix!==void 0){let h=new be;h.fromArray(s.matrix),u.applyMatrix4(h)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);if(!r.associations.has(u))r.associations.set(u,{});else if(s.mesh!==void 0&&r.meshCache.refs[s.mesh]>1){let h=r.associations.get(u);r.associations.set(u,{...h})}return r.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let n=this.extensions,i=this.json.scenes[e],r=this,s=new kt;i.name&&(s.name=r.createUniqueName(i.name)),Mr(s,i),i.extensions&&Hs(n,s,i);let o=i.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(r.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,h=l.length;u<h;u++)s.add(l[u]);let c=u=>{let h=new Map;for(let[d,f]of r.associations)(d instanceof mn||d instanceof an)&&h.set(d,f);return u.traverse(d=>{let f=r.associations.get(d);f!=null&&h.set(d,f)}),h};return r.associations=c(s),s})}_createAnimationTracks(e,n,i,r,s){let o=[],a=e.name?e.name:e.uuid,l=[];qr[s.path]===qr.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(qr[s.path]){case qr.weights:c=Hi;break;case qr.rotation:c=Vi;break;case qr.translation:case qr.scale:c=zi;break;default:switch(i.itemSize){case 1:c=Hi;break;case 2:case 3:default:c=zi;break}break}let u=r.interpolation!==void 0?mA[r.interpolation]:Ss,h=this._getArrayFromAccessor(i);for(let d=0,f=l.length;d<f;d++){let g=new c(l[d]+"."+qr[s.path],n.array,h,u);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let n=e.array;if(e.normalized){let i=Fp(n.constructor),r=new Float32Array(n.length);for(let s=0,o=n.length;s<o;s++)r[s]=n[s]*i;n=r}return n}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(i){let r=this instanceof Vi?Dp:th;return new r(this.times,this.values,this.getValueSize()/3,i)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function EA(t,e,n){let i=e.attributes,r=new Xn;if(i.POSITION!==void 0){let a=n.json.accessors[i.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(r.set(new w(l[0],l[1],l[2]),new w(c[0],c[1],c[2])),a.normalized){let u=Fp(Wo[a.componentType]);r.min.multiplyScalar(u),r.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let s=e.targets;if(s!==void 0){let a=new w,l=new w;for(let c=0,u=s.length;c<u;c++){let h=s[c];if(h.POSITION!==void 0){let d=n.json.accessors[h.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let _=Fp(Wo[d.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}r.expandByVector(a)}t.boundingBox=r;let o=new Pn;r.getCenter(o.center),o.radius=r.min.distanceTo(r.max)/2,t.boundingSphere=o}function Tv(t,e,n){let i=e.attributes,r=[];function s(o,a){return n.getDependency("accessor",o).then(function(l){t.setAttribute(a,l)})}for(let o in i){let a=Op[o]||o.toLowerCase();a in t.attributes||r.push(s(i[o],a))}if(e.indices!==void 0&&!t.index){let o=n.getDependency("accessor",e.indices).then(function(a){t.setIndex(a)});r.push(o)}return nt.workingColorSpace!==hn&&"COLOR_0"in i&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${nt.workingColorSpace}" not supported.`),Mr(t,e),EA(t,e,n),Promise.all(r).then(function(){return e.targets!==void 0?_A(t,e.targets,n):t})}var nh=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())}),dt=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())}),wv=class extends _t{constructor(t){super(),this.weight=0,this.isBinary=!1,this.overrideBlink="none",this.overrideLookAt="none",this.overrideMouth="none",this._binds=[],this.name=`VRMExpression_${t}`,this.expressionName=t,this.type="VRMExpression",this.visible=!1}get binds(){return this._binds}get overrideBlinkAmount(){return this.overrideBlink==="block"?0<this.outputWeight?1:0:this.overrideBlink==="blend"?this.outputWeight:0}get overrideLookAtAmount(){return this.overrideLookAt==="block"?0<this.outputWeight?1:0:this.overrideLookAt==="blend"?this.outputWeight:0}get overrideMouthAmount(){return this.overrideMouth==="block"?0<this.outputWeight?1:0:this.overrideMouth==="blend"?this.outputWeight:0}get outputWeight(){return this.isBinary?this.weight>.5?1:0:this.weight}addBind(t){this._binds.push(t)}deleteBind(t){let e=this._binds.indexOf(t);e>=0&&this._binds.splice(e,1)}applyWeight(t){var e;let n=this.outputWeight;n*=(e=t?.multiplier)!=null?e:1,this.isBinary&&n<1&&(n=0),this._binds.forEach(i=>i.applyWeight(n))}clearAppliedWeight(){this._binds.forEach(t=>t.clearAppliedWeight())}};function lx(t,e,n){var i,r;let s=t.parser.json,o=(i=s.nodes)==null?void 0:i[e];if(o==null)return console.warn(`extractPrimitivesInternal: Attempt to use nodes[${e}] of glTF but the node doesn't exist`),null;let a=o.mesh;if(a==null)return null;let l=(r=s.meshes)==null?void 0:r[a];if(l==null)return console.warn(`extractPrimitivesInternal: Attempt to use meshes[${a}] of glTF but the mesh doesn't exist`),null;let c=l.primitives.length,u=[];return n.traverse(h=>{u.length<c&&h.isMesh&&u.push(h)}),u}function Av(t,e){return dt(this,null,function*(){let n=yield t.parser.getDependency("node",e);return lx(t,e,n)})}function Rv(t){return dt(this,null,function*(){let e=yield t.parser.getDependencies("node"),n=new Map;return e.forEach((i,r)=>{let s=lx(t,r,i);s!=null&&n.set(r,s)}),n})}var Kp={Aa:"aa",Ih:"ih",Ou:"ou",Ee:"ee",Oh:"oh",Blink:"blink",Happy:"happy",Angry:"angry",Sad:"sad",Relaxed:"relaxed",LookUp:"lookUp",Surprised:"surprised",LookDown:"lookDown",LookLeft:"lookLeft",LookRight:"lookRight",BlinkLeft:"blinkLeft",BlinkRight:"blinkRight",Neutral:"neutral"};function cx(t){return Math.max(Math.min(t,1),0)}var Cv=class ux{constructor(){this.blinkExpressionNames=["blink","blinkLeft","blinkRight"],this.lookAtExpressionNames=["lookLeft","lookRight","lookUp","lookDown"],this.mouthExpressionNames=["aa","ee","ih","oh","ou"],this._expressions=[],this._expressionMap={}}get expressions(){return this._expressions.concat()}get expressionMap(){return Object.assign({},this._expressionMap)}get presetExpressionMap(){let e={},n=new Set(Object.values(Kp));return Object.entries(this._expressionMap).forEach(([i,r])=>{n.has(i)&&(e[i]=r)}),e}get customExpressionMap(){let e={},n=new Set(Object.values(Kp));return Object.entries(this._expressionMap).forEach(([i,r])=>{n.has(i)||(e[i]=r)}),e}copy(e){return this._expressions.concat().forEach(i=>{this.unregisterExpression(i)}),e._expressions.forEach(i=>{this.registerExpression(i)}),this.blinkExpressionNames=e.blinkExpressionNames.concat(),this.lookAtExpressionNames=e.lookAtExpressionNames.concat(),this.mouthExpressionNames=e.mouthExpressionNames.concat(),this}clone(){return new ux().copy(this)}getExpression(e){var n;return(n=this._expressionMap[e])!=null?n:null}registerExpression(e){this._expressions.push(e),this._expressionMap[e.expressionName]=e}unregisterExpression(e){let n=this._expressions.indexOf(e);n===-1&&console.warn("VRMExpressionManager: The specified expressions is not registered"),this._expressions.splice(n,1),delete this._expressionMap[e.expressionName]}getValue(e){var n;let i=this.getExpression(e);return(n=i?.weight)!=null?n:null}setValue(e,n){let i=this.getExpression(e);i&&(i.weight=cx(n))}resetValues(){this._expressions.forEach(e=>{e.weight=0})}getExpressionTrackName(e){let n=this.getExpression(e);return n?`${n.name}.weight`:null}update(){let e=this._calculateWeightMultipliers();this._expressions.forEach(n=>{n.clearAppliedWeight()}),this._expressions.forEach(n=>{let i=1,r=n.expressionName;this.blinkExpressionNames.indexOf(r)!==-1&&(i*=e.blink),this.lookAtExpressionNames.indexOf(r)!==-1&&(i*=e.lookAt),this.mouthExpressionNames.indexOf(r)!==-1&&(i*=e.mouth),n.applyWeight({multiplier:i})})}_calculateWeightMultipliers(){let e=1,n=1,i=1;return this._expressions.forEach(r=>{e-=r.overrideBlinkAmount,n-=r.overrideLookAtAmount,i-=r.overrideMouthAmount}),e=Math.max(0,e),n=Math.max(0,n),i=Math.max(0,i),{blink:e,lookAt:n,mouth:i}}},bl={Color:"color",EmissionColor:"emissionColor",ShadeColor:"shadeColor",MatcapColor:"matcapColor",RimColor:"rimColor",OutlineColor:"outlineColor"},SA={_Color:bl.Color,_EmissionColor:bl.EmissionColor,_ShadeColor:bl.ShadeColor,_RimColor:bl.RimColor,_OutlineColor:bl.OutlineColor},TA=new xe,hx=class dx{constructor({material:e,type:n,targetValue:i,targetAlpha:r}){this.material=e,this.type=n,this.targetValue=i,this.targetAlpha=r??1;let s=this._initColorBindState(),o=this._initAlphaBindState();this._state={color:s,alpha:o}}applyWeight(e){let{color:n,alpha:i}=this._state;if(n!=null){let{propertyName:r,deltaValue:s}=n,o=this.material[r];o?.add(TA.copy(s).multiplyScalar(e))}if(i!=null){let{propertyName:r,deltaValue:s}=i;this.material[r]!=null&&(this.material[r]+=s*e)}}clearAppliedWeight(){let{color:e,alpha:n}=this._state;if(e!=null){let{propertyName:i,initialValue:r}=e,s=this.material[i];s?.copy(r)}if(n!=null){let{propertyName:i,initialValue:r}=n;this.material[i]!=null&&(this.material[i]=r)}}_initColorBindState(){var e,n,i;let{material:r,type:s,targetValue:o}=this,a=this._getPropertyNameMap(),l=(n=(e=a?.[s])==null?void 0:e[0])!=null?n:null;if(l==null)return console.warn(`Tried to add a material color bind to the material ${(i=r.name)!=null?i:"(no name)"}, the type ${s} but the material or the type is not supported.`),null;let u=r[l].clone(),h=new xe(o.r-u.r,o.g-u.g,o.b-u.b);return{propertyName:l,initialValue:u,deltaValue:h}}_initAlphaBindState(){var e,n,i;let{material:r,type:s,targetAlpha:o}=this,a=this._getPropertyNameMap(),l=(n=(e=a?.[s])==null?void 0:e[1])!=null?n:null;if(l==null&&o!==1)return console.warn(`Tried to add a material alpha bind to the material ${(i=r.name)!=null?i:"(no name)"}, the type ${s} but the material or the type does not support alpha.`),null;if(l==null)return null;let c=r[l],u=o-c;return{propertyName:l,initialValue:c,deltaValue:u}}_getPropertyNameMap(){var e,n;return(n=(e=Object.entries(dx._propertyNameMapMap).find(([i])=>this.material[i]===!0))==null?void 0:e[1])!=null?n:null}};hx._propertyNameMapMap={isMeshStandardMaterial:{color:["color","opacity"],emissionColor:["emissive",null]},isMeshBasicMaterial:{color:["color","opacity"]},isMToonMaterial:{color:["color","opacity"],emissionColor:["emissive",null],outlineColor:["outlineColorFactor",null],matcapColor:["matcapFactor",null],rimColor:["parametricRimColorFactor",null],shadeColor:["shadeColorFactor",null]}};var Iv=hx,ch=class{constructor({primitives:t,index:e,weight:n}){this.primitives=t,this.index=e,this.weight=n}applyWeight(t){this.primitives.forEach(e=>{var n;((n=e.morphTargetInfluences)==null?void 0:n[this.index])!=null&&(e.morphTargetInfluences[this.index]+=this.weight*t)})}clearAppliedWeight(){this.primitives.forEach(t=>{var e;((e=t.morphTargetInfluences)==null?void 0:e[this.index])!=null&&(t.morphTargetInfluences[this.index]=0)})}},Pv=new Ye,fx=class px{constructor({material:e,scale:n,offset:i}){var r,s;this.material=e,this.scale=n,this.offset=i;let o=(r=Object.entries(px._propertyNamesMap).find(([a])=>e[a]===!0))==null?void 0:r[1];o==null?(console.warn(`Tried to add a texture transform bind to the material ${(s=e.name)!=null?s:"(no name)"} but the material is not supported.`),this._properties=[]):(this._properties=[],o.forEach(a=>{var l;let c=(l=e[a])==null?void 0:l.clone();if(!c)return null;e[a]=c;let u=c.offset.clone(),h=c.repeat.clone(),d=i.clone().sub(u),f=n.clone().sub(h);this._properties.push({name:a,initialOffset:u,deltaOffset:d,initialScale:h,deltaScale:f})}))}applyWeight(e){this._properties.forEach(n=>{let i=this.material[n.name];i!==void 0&&(i.offset.add(Pv.copy(n.deltaOffset).multiplyScalar(e)),i.repeat.add(Pv.copy(n.deltaScale).multiplyScalar(e)))})}clearAppliedWeight(){this._properties.forEach(e=>{let n=this.material[e.name];n!==void 0&&(n.offset.copy(e.initialOffset),n.repeat.copy(e.initialScale))})}};fx._propertyNamesMap={isMeshStandardMaterial:["map","emissiveMap","bumpMap","normalMap","displacementMap","roughnessMap","metalnessMap","alphaMap"],isMeshBasicMaterial:["map","specularMap","alphaMap"],isMToonMaterial:["map","normalMap","emissiveMap","shadeMultiplyTexture","rimMultiplyTexture","outlineWidthMultiplyTexture","uvAnimationMaskTexture"]};var Lv=fx,bA=new Set(["1.0","1.0-beta"]),mx=class gx{get name(){return"VRMExpressionLoaderPlugin"}constructor(e){this.parser=e}afterRoot(e){return dt(this,null,function*(){e.userData.vrmExpressionManager=yield this._import(e)})}_import(e){return dt(this,null,function*(){let n=yield this._v1Import(e);if(n)return n;let i=yield this._v0Import(e);return i||null})}_v1Import(e){return dt(this,null,function*(){var n,i;let r=this.parser.json;if(!(((n=r.extensionsUsed)==null?void 0:n.indexOf("VRMC_vrm"))!==-1))return null;let o=(i=r.extensions)==null?void 0:i.VRMC_vrm;if(!o)return null;let a=o.specVersion;if(!bA.has(a))return console.warn(`VRMExpressionLoaderPlugin: Unknown VRMC_vrm specVersion "${a}"`),null;let l=o.expressions;if(!l)return null;let c=new Set(Object.values(Kp)),u=new Map;l.preset!=null&&Object.entries(l.preset).forEach(([d,f])=>{if(f!=null){if(!c.has(d)){console.warn(`VRMExpressionLoaderPlugin: Unknown preset name "${d}" detected. Ignoring the expression`);return}u.set(d,f)}}),l.custom!=null&&Object.entries(l.custom).forEach(([d,f])=>{if(c.has(d)){console.warn(`VRMExpressionLoaderPlugin: Custom expression cannot have preset name "${d}". Ignoring the expression`);return}u.set(d,f)});let h=new Cv;return yield Promise.all(Array.from(u.entries()).map(d=>dt(this,[d],function*([f,g]){var _,m,p,E,T,v,C;let A=new wv(f);if(e.scene.add(A),A.isBinary=(_=g.isBinary)!=null?_:!1,A.overrideBlink=(m=g.overrideBlink)!=null?m:"none",A.overrideLookAt=(p=g.overrideLookAt)!=null?p:"none",A.overrideMouth=(E=g.overrideMouth)!=null?E:"none",(T=g.morphTargetBinds)==null||T.forEach(b=>dt(this,null,function*(){var P;if(b.node===void 0||b.index===void 0)return;let S=yield Av(e,b.node),y=b.index;if(!S.every(L=>Array.isArray(L.morphTargetInfluences)&&y<L.morphTargetInfluences.length)){console.warn(`VRMExpressionLoaderPlugin: ${g.name} attempts to index morph #${y} but not found.`);return}A.addBind(new ch({primitives:S,index:y,weight:(P=b.weight)!=null?P:1}))})),g.materialColorBinds||g.textureTransformBinds){let b=[];e.scene.traverse(P=>{let S=P.material;S&&(Array.isArray(S)?b.push(...S):b.push(S))}),(v=g.materialColorBinds)==null||v.forEach(P=>dt(this,null,function*(){b.filter(y=>{var L;let F=(L=this.parser.associations.get(y))==null?void 0:L.materials;return P.material===F}).forEach(y=>{A.addBind(new Iv({material:y,type:P.type,targetValue:new xe().fromArray(P.targetValue),targetAlpha:P.targetValue[3]}))})})),(C=g.textureTransformBinds)==null||C.forEach(P=>dt(this,null,function*(){b.filter(y=>{var L;let F=(L=this.parser.associations.get(y))==null?void 0:L.materials;return P.material===F}).forEach(y=>{var L,F;A.addBind(new Lv({material:y,offset:new Ye().fromArray((L=P.offset)!=null?L:[0,0]),scale:new Ye().fromArray((F=P.scale)!=null?F:[1,1])}))})}))}h.registerExpression(A)}))),h})}_v0Import(e){return dt(this,null,function*(){var n;let i=this.parser.json,r=(n=i.extensions)==null?void 0:n.VRM;if(!r)return null;let s=r.blendShapeMaster;if(!s)return null;let o=new Cv,a=s.blendShapeGroups;if(!a)return o;let l=new Set;return yield Promise.all(a.map(c=>dt(this,null,function*(){var u;let h=c.presetName,d=h!=null&&gx.v0v1PresetNameMap[h]||null,f=d??c.name;if(f==null){console.warn("VRMExpressionLoaderPlugin: One of custom expressions has no name. Ignoring the expression");return}if(l.has(f)){console.warn(`VRMExpressionLoaderPlugin: An expression preset ${h} has duplicated entries. Ignoring the expression`);return}l.add(f);let g=new wv(f);e.scene.add(g),g.isBinary=(u=c.isBinary)!=null?u:!1,c.binds&&c.binds.forEach(m=>dt(this,null,function*(){var p;if(m.mesh===void 0||m.index===void 0)return;let E=[];(p=i.nodes)==null||p.forEach((v,C)=>{v.mesh===m.mesh&&E.push(C)});let T=m.index;yield Promise.all(E.map(v=>dt(this,null,function*(){var C;let A=yield Av(e,v);if(!A.every(b=>Array.isArray(b.morphTargetInfluences)&&T<b.morphTargetInfluences.length)){console.warn(`VRMExpressionLoaderPlugin: ${c.name} attempts to index ${T}th morph but not found.`);return}g.addBind(new ch({primitives:A,index:T,weight:.01*((C=m.weight)!=null?C:100)}))})))}));let _=c.materialValues;_&&_.length!==0&&_.forEach(m=>{if(m.materialName===void 0||m.propertyName===void 0||m.targetValue===void 0)return;let p=[];e.scene.traverse(T=>{if(T.material){let v=T.material;Array.isArray(v)?p.push(...v.filter(C=>(C.name===m.materialName||C.name===m.materialName+" (Outline)")&&p.indexOf(C)===-1)):v.name===m.materialName&&p.indexOf(v)===-1&&p.push(v)}});let E=m.propertyName;p.forEach(T=>{if(E==="_MainTex_ST"){let C=new Ye(m.targetValue[0],m.targetValue[1]),A=new Ye(m.targetValue[2],m.targetValue[3]);A.y=1-A.y-C.y,g.addBind(new Lv({material:T,scale:C,offset:A}));return}let v=SA[E];if(v){g.addBind(new Iv({material:T,type:v,targetValue:new xe().fromArray(m.targetValue),targetAlpha:m.targetValue[3]}));return}console.warn(E+" is not supported")})}),o.registerExpression(g)}))),o})}};mx.v0v1PresetNameMap={a:"aa",e:"ee",i:"ih",o:"oh",u:"ou",blink:"blink",joy:"happy",angry:"angry",sorrow:"sad",fun:"relaxed",lookup:"lookUp",lookdown:"lookDown",lookleft:"lookLeft",lookright:"lookRight",blink_l:"blinkLeft",blink_r:"blinkRight",neutral:"neutral"};var wA=mx;var im=class $o{constructor(e,n){this._firstPersonOnlyLayer=$o.DEFAULT_FIRSTPERSON_ONLY_LAYER,this._thirdPersonOnlyLayer=$o.DEFAULT_THIRDPERSON_ONLY_LAYER,this._initializedLayers=!1,this.humanoid=e,this.meshAnnotations=n}copy(e){if(this.humanoid!==e.humanoid)throw new Error("VRMFirstPerson: humanoid must be same in order to copy");return this.meshAnnotations=e.meshAnnotations.map(n=>({meshes:n.meshes.concat(),type:n.type})),this}clone(){return new $o(this.humanoid,this.meshAnnotations).copy(this)}get firstPersonOnlyLayer(){return this._firstPersonOnlyLayer}get thirdPersonOnlyLayer(){return this._thirdPersonOnlyLayer}setup({firstPersonOnlyLayer:e=$o.DEFAULT_FIRSTPERSON_ONLY_LAYER,thirdPersonOnlyLayer:n=$o.DEFAULT_THIRDPERSON_ONLY_LAYER}={}){this._initializedLayers||(this._firstPersonOnlyLayer=e,this._thirdPersonOnlyLayer=n,this.meshAnnotations.forEach(i=>{i.meshes.forEach(r=>{i.type==="firstPersonOnly"?(r.layers.set(this._firstPersonOnlyLayer),r.traverse(s=>s.layers.set(this._firstPersonOnlyLayer))):i.type==="thirdPersonOnly"?(r.layers.set(this._thirdPersonOnlyLayer),r.traverse(s=>s.layers.set(this._thirdPersonOnlyLayer))):i.type==="auto"&&this._createHeadlessModel(r)})}),this._initializedLayers=!0)}_excludeTriangles(e,n,i,r){let s=0;if(n!=null&&n.length>0)for(let o=0;o<e.length;o+=3){let a=e[o],l=e[o+1],c=e[o+2],u=n[a],h=i[a];if(u[0]>0&&r.includes(h[0])||u[1]>0&&r.includes(h[1])||u[2]>0&&r.includes(h[2])||u[3]>0&&r.includes(h[3]))continue;let d=n[l],f=i[l];if(d[0]>0&&r.includes(f[0])||d[1]>0&&r.includes(f[1])||d[2]>0&&r.includes(f[2])||d[3]>0&&r.includes(f[3]))continue;let g=n[c],_=i[c];g[0]>0&&r.includes(_[0])||g[1]>0&&r.includes(_[1])||g[2]>0&&r.includes(_[2])||g[3]>0&&r.includes(_[3])||(e[s++]=a,e[s++]=l,e[s++]=c)}return s}_createErasedMesh(e,n){let i=new As(e.geometry.clone(),e.material);i.name=`${e.name}(erase)`,i.frustumCulled=e.frustumCulled,i.layers.set(this._firstPersonOnlyLayer);let r=i.geometry,s=r.getAttribute("skinIndex"),o=s instanceof Uo?[]:s.array,a=[];for(let _=0;_<o.length;_+=4)a.push([o[_],o[_+1],o[_+2],o[_+3]]);let l=r.getAttribute("skinWeight"),c=l instanceof Uo?[]:l.array,u=[];for(let _=0;_<c.length;_+=4)u.push([c[_],c[_+1],c[_+2],c[_+3]]);let h=r.getIndex();if(!h)throw new Error("The geometry doesn't have an index buffer");let d=Array.from(h.array),f=this._excludeTriangles(d,u,a,n),g=[];for(let _=0;_<f;_++)g[_]=d[_];return r.setIndex(g),e.onBeforeRender&&(i.onBeforeRender=e.onBeforeRender),i.bind(new wi(e.skeleton.bones,e.skeleton.boneInverses),new be),i}_createHeadlessModelForSkinnedMesh(e,n){let i=[];if(n.skeleton.bones.forEach((s,o)=>{this._isEraseTarget(s)&&i.push(o)}),!i.length){n.layers.enable(this._thirdPersonOnlyLayer),n.layers.enable(this._firstPersonOnlyLayer);return}n.layers.set(this._thirdPersonOnlyLayer);let r=this._createErasedMesh(n,i);e.add(r)}_createHeadlessModel(e){if(e.type==="Group")if(e.layers.set(this._thirdPersonOnlyLayer),this._isEraseTarget(e))e.traverse(n=>n.layers.set(this._thirdPersonOnlyLayer));else{let n=new kt;n.name=`_headless_${e.name}`,n.layers.set(this._firstPersonOnlyLayer),e.parent.add(n),e.children.filter(i=>i.type==="SkinnedMesh").forEach(i=>{let r=i;this._createHeadlessModelForSkinnedMesh(n,r)})}else if(e.type==="SkinnedMesh"){let n=e;this._createHeadlessModelForSkinnedMesh(e.parent,n)}else this._isEraseTarget(e)&&(e.layers.set(this._thirdPersonOnlyLayer),e.traverse(n=>n.layers.set(this._thirdPersonOnlyLayer)))}_isEraseTarget(e){return e===this.humanoid.getRawBoneNode("head")?!0:e.parent?this._isEraseTarget(e.parent):!1}};im.DEFAULT_FIRSTPERSON_ONLY_LAYER=9;im.DEFAULT_THIRDPERSON_ONLY_LAYER=10;var Uv=im,AA=new Set(["1.0","1.0-beta"]),RA=class{get name(){return"VRMFirstPersonLoaderPlugin"}constructor(t){this.parser=t}afterRoot(t){return dt(this,null,function*(){let e=t.userData.vrmHumanoid;if(e!==null){if(e===void 0)throw new Error("VRMFirstPersonLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");t.userData.vrmFirstPerson=yield this._import(t,e)}})}_import(t,e){return dt(this,null,function*(){if(e==null)return null;let n=yield this._v1Import(t,e);if(n)return n;let i=yield this._v0Import(t,e);return i||null})}_v1Import(t,e){return dt(this,null,function*(){var n,i;let r=this.parser.json;if(!(((n=r.extensionsUsed)==null?void 0:n.indexOf("VRMC_vrm"))!==-1))return null;let o=(i=r.extensions)==null?void 0:i.VRMC_vrm;if(!o)return null;let a=o.specVersion;if(!AA.has(a))return console.warn(`VRMFirstPersonLoaderPlugin: Unknown VRMC_vrm specVersion "${a}"`),null;let l=o.firstPerson,c=[],u=yield Rv(t);return Array.from(u.entries()).forEach(([h,d])=>{var f,g;let _=(f=l?.meshAnnotations)==null?void 0:f.find(m=>m.node===h);c.push({meshes:d,type:(g=_?.type)!=null?g:"auto"})}),new Uv(e,c)})}_v0Import(t,e){return dt(this,null,function*(){var n;let i=this.parser.json,r=(n=i.extensions)==null?void 0:n.VRM;if(!r)return null;let s=r.firstPerson;if(!s)return null;let o=[],a=yield Rv(t);return Array.from(a.entries()).forEach(([l,c])=>{let u=i.nodes[l],h=s.meshAnnotations?s.meshAnnotations.find(d=>d.mesh===u.mesh):void 0;o.push({meshes:c,type:this._convertV0FlagToV1Type(h?.firstPersonFlag)})}),new Uv(e,o)})}_convertV0FlagToV1Type(t){return t==="FirstPersonOnly"?"firstPersonOnly":t==="ThirdPersonOnly"?"thirdPersonOnly":t==="Both"?"both":"auto"}};var Nv=new w,Dv=new w,CA=new he,Ov=class extends kt{constructor(t){super(),this.vrmHumanoid=t,this._boneAxesMap=new Map,Object.values(t.humanBones).forEach(e=>{let n=new pl(1);n.matrixAutoUpdate=!1,n.material.depthTest=!1,n.material.depthWrite=!1,this.add(n),this._boneAxesMap.set(e,n)})}dispose(){Array.from(this._boneAxesMap.values()).forEach(t=>{t.geometry.dispose(),t.material.dispose()})}updateMatrixWorld(t){Array.from(this._boneAxesMap.entries()).forEach(([e,n])=>{e.node.updateWorldMatrix(!0,!1),e.node.matrixWorld.decompose(Nv,CA,Dv);let i=Nv.set(.1,.1,.1).divide(Dv);n.matrix.copy(e.node.matrixWorld).scale(i)}),super.updateMatrixWorld(t)}},kp=["hips","spine","chest","upperChest","neck","head","leftEye","rightEye","jaw","leftUpperLeg","leftLowerLeg","leftFoot","leftToes","rightUpperLeg","rightLowerLeg","rightFoot","rightToes","leftShoulder","leftUpperArm","leftLowerArm","leftHand","rightShoulder","rightUpperArm","rightLowerArm","rightHand","leftThumbMetacarpal","leftThumbProximal","leftThumbDistal","leftIndexProximal","leftIndexIntermediate","leftIndexDistal","leftMiddleProximal","leftMiddleIntermediate","leftMiddleDistal","leftRingProximal","leftRingIntermediate","leftRingDistal","leftLittleProximal","leftLittleIntermediate","leftLittleDistal","rightThumbMetacarpal","rightThumbProximal","rightThumbDistal","rightIndexProximal","rightIndexIntermediate","rightIndexDistal","rightMiddleProximal","rightMiddleIntermediate","rightMiddleDistal","rightRingProximal","rightRingIntermediate","rightRingDistal","rightLittleProximal","rightLittleIntermediate","rightLittleDistal"];var IA={hips:null,spine:"hips",chest:"spine",upperChest:"chest",neck:"upperChest",head:"neck",leftEye:"head",rightEye:"head",jaw:"head",leftUpperLeg:"hips",leftLowerLeg:"leftUpperLeg",leftFoot:"leftLowerLeg",leftToes:"leftFoot",rightUpperLeg:"hips",rightLowerLeg:"rightUpperLeg",rightFoot:"rightLowerLeg",rightToes:"rightFoot",leftShoulder:"upperChest",leftUpperArm:"leftShoulder",leftLowerArm:"leftUpperArm",leftHand:"leftLowerArm",rightShoulder:"upperChest",rightUpperArm:"rightShoulder",rightLowerArm:"rightUpperArm",rightHand:"rightLowerArm",leftThumbMetacarpal:"leftHand",leftThumbProximal:"leftThumbMetacarpal",leftThumbDistal:"leftThumbProximal",leftIndexProximal:"leftHand",leftIndexIntermediate:"leftIndexProximal",leftIndexDistal:"leftIndexIntermediate",leftMiddleProximal:"leftHand",leftMiddleIntermediate:"leftMiddleProximal",leftMiddleDistal:"leftMiddleIntermediate",leftRingProximal:"leftHand",leftRingIntermediate:"leftRingProximal",leftRingDistal:"leftRingIntermediate",leftLittleProximal:"leftHand",leftLittleIntermediate:"leftLittleProximal",leftLittleDistal:"leftLittleIntermediate",rightThumbMetacarpal:"rightHand",rightThumbProximal:"rightThumbMetacarpal",rightThumbDistal:"rightThumbProximal",rightIndexProximal:"rightHand",rightIndexIntermediate:"rightIndexProximal",rightIndexDistal:"rightIndexIntermediate",rightMiddleProximal:"rightHand",rightMiddleIntermediate:"rightMiddleProximal",rightMiddleDistal:"rightMiddleIntermediate",rightRingProximal:"rightHand",rightRingIntermediate:"rightRingProximal",rightRingDistal:"rightRingIntermediate",rightLittleProximal:"rightHand",rightLittleIntermediate:"rightLittleProximal",rightLittleDistal:"rightLittleIntermediate"};function _x(t){return t.invert?t.invert():t.inverse(),t}var Vs=new w,zs=new he,Jp=class{constructor(t){this.humanBones=t,this.restPose=this.getAbsolutePose()}getAbsolutePose(){let t={};return Object.keys(this.humanBones).forEach(e=>{let n=e,i=this.getBoneNode(n);i&&(Vs.copy(i.position),zs.copy(i.quaternion),t[n]={position:Vs.toArray(),rotation:zs.toArray()})}),t}getPose(){let t={};return Object.keys(this.humanBones).forEach(e=>{let n=e,i=this.getBoneNode(n);if(!i)return;Vs.set(0,0,0),zs.identity();let r=this.restPose[n];r?.position&&Vs.fromArray(r.position).negate(),r?.rotation&&_x(zs.fromArray(r.rotation)),Vs.add(i.position),zs.premultiply(i.quaternion),t[n]={position:Vs.toArray(),rotation:zs.toArray()}}),t}setPose(t){Object.entries(t).forEach(([e,n])=>{let i=e,r=this.getBoneNode(i);if(!r)return;let s=this.restPose[i];s&&(n?.position&&(r.position.fromArray(n.position),s.position&&r.position.add(Vs.fromArray(s.position))),n?.rotation&&(r.quaternion.fromArray(n.rotation),s.rotation&&r.quaternion.multiply(zs.fromArray(s.rotation))))})}resetPose(){Object.entries(this.restPose).forEach(([t,e])=>{let n=this.getBoneNode(t);n&&(e?.position&&n.position.fromArray(e.position),e?.rotation&&n.quaternion.fromArray(e.rotation))})}getBone(t){var e;return(e=this.humanBones[t])!=null?e:void 0}getBoneNode(t){var e,n;return(n=(e=this.humanBones[t])==null?void 0:e.node)!=null?n:null}},Hp=new w,PA=new he,LA=new w,Fv=class vx extends Jp{static _setupTransforms(e){let n=new _t;n.name="VRMHumanoidRig";let i={},r={},s={},o={};kp.forEach(l=>{var c;let u=e.getBoneNode(l);if(u){let h=new w,d=new he;u.updateWorldMatrix(!0,!1),u.matrixWorld.decompose(h,d,Hp),i[l]=h,r[l]=d,s[l]=u.quaternion.clone();let f=new he;(c=u.parent)==null||c.matrixWorld.decompose(Hp,f,Hp),o[l]=f}});let a={};return kp.forEach(l=>{var c;let u=e.getBoneNode(l);if(u){let h=i[l],d=l,f;for(;f==null&&(d=IA[d],d!=null);)f=i[d];let g=new _t;g.name="Normalized_"+u.name,(d?(c=a[d])==null?void 0:c.node:n).add(g),g.position.copy(h),f&&g.position.sub(f),a[l]={node:g}}}),{rigBones:a,root:n,parentWorldRotations:o,boneRotations:s}}constructor(e){let{rigBones:n,root:i,parentWorldRotations:r,boneRotations:s}=vx._setupTransforms(e);super(n),this.original=e,this.root=i,this._parentWorldRotations=r,this._boneRotations=s}update(){kp.forEach(e=>{let n=this.original.getBoneNode(e);if(n!=null){let i=this.getBoneNode(e),r=this._parentWorldRotations[e],s=PA.copy(r).invert(),o=this._boneRotations[e];if(n.quaternion.copy(i.quaternion).multiply(r).premultiply(s).multiply(o),e==="hips"){let a=i.getWorldPosition(LA);n.parent.updateWorldMatrix(!0,!1);let l=n.parent.matrixWorld,c=a.applyMatrix4(l.invert());n.position.copy(c)}}})}},Bv=class xx{get restPose(){return console.warn("VRMHumanoid: restPose is deprecated. Use either rawRestPose or normalizedRestPose instead."),this.rawRestPose}get rawRestPose(){return this._rawHumanBones.restPose}get normalizedRestPose(){return this._normalizedHumanBones.restPose}get humanBones(){return this._rawHumanBones.humanBones}get rawHumanBones(){return this._rawHumanBones.humanBones}get normalizedHumanBones(){return this._normalizedHumanBones.humanBones}get normalizedHumanBonesRoot(){return this._normalizedHumanBones.root}constructor(e,n){var i;this.autoUpdateHumanBones=(i=n?.autoUpdateHumanBones)!=null?i:!0,this._rawHumanBones=new Jp(e),this._normalizedHumanBones=new Fv(this._rawHumanBones)}copy(e){return this.autoUpdateHumanBones=e.autoUpdateHumanBones,this._rawHumanBones=new Jp(e.humanBones),this._normalizedHumanBones=new Fv(this._rawHumanBones),this}clone(){return new xx(this.humanBones,{autoUpdateHumanBones:this.autoUpdateHumanBones}).copy(this)}getAbsolutePose(){return console.warn("VRMHumanoid: getAbsolutePose() is deprecated. Use either getRawAbsolutePose() or getNormalizedAbsolutePose() instead."),this.getRawAbsolutePose()}getRawAbsolutePose(){return this._rawHumanBones.getAbsolutePose()}getNormalizedAbsolutePose(){return this._normalizedHumanBones.getAbsolutePose()}getPose(){return console.warn("VRMHumanoid: getPose() is deprecated. Use either getRawPose() or getNormalizedPose() instead."),this.getRawPose()}getRawPose(){return this._rawHumanBones.getPose()}getNormalizedPose(){return this._normalizedHumanBones.getPose()}setPose(e){return console.warn("VRMHumanoid: setPose() is deprecated. Use either setRawPose() or setNormalizedPose() instead."),this.setRawPose(e)}setRawPose(e){return this._rawHumanBones.setPose(e)}setNormalizedPose(e){return this._normalizedHumanBones.setPose(e)}resetPose(){return console.warn("VRMHumanoid: resetPose() is deprecated. Use either resetRawPose() or resetNormalizedPose() instead."),this.resetRawPose()}resetRawPose(){return this._rawHumanBones.resetPose()}resetNormalizedPose(){return this._normalizedHumanBones.resetPose()}getBone(e){return console.warn("VRMHumanoid: getBone() is deprecated. Use either getRawBone() or getNormalizedBone() instead."),this.getRawBone(e)}getRawBone(e){return this._rawHumanBones.getBone(e)}getNormalizedBone(e){return this._normalizedHumanBones.getBone(e)}getBoneNode(e){return console.warn("VRMHumanoid: getBoneNode() is deprecated. Use either getRawBoneNode() or getNormalizedBoneNode() instead."),this.getRawBoneNode(e)}getRawBoneNode(e){return this._rawHumanBones.getBoneNode(e)}getNormalizedBoneNode(e){return this._normalizedHumanBones.getBoneNode(e)}update(){this.autoUpdateHumanBones&&this._normalizedHumanBones.update()}},UA={Hips:"hips",Spine:"spine",Head:"head",LeftUpperLeg:"leftUpperLeg",LeftLowerLeg:"leftLowerLeg",LeftFoot:"leftFoot",RightUpperLeg:"rightUpperLeg",RightLowerLeg:"rightLowerLeg",RightFoot:"rightFoot",LeftUpperArm:"leftUpperArm",LeftLowerArm:"leftLowerArm",LeftHand:"leftHand",RightUpperArm:"rightUpperArm",RightLowerArm:"rightLowerArm",RightHand:"rightHand"},NA=new Set(["1.0","1.0-beta"]),kv={leftThumbProximal:"leftThumbMetacarpal",leftThumbIntermediate:"leftThumbProximal",rightThumbProximal:"rightThumbMetacarpal",rightThumbIntermediate:"rightThumbProximal"},DA=class{get name(){return"VRMHumanoidLoaderPlugin"}constructor(t,e){this.parser=t,this.helperRoot=e?.helperRoot,this.autoUpdateHumanBones=e?.autoUpdateHumanBones}afterRoot(t){return dt(this,null,function*(){t.userData.vrmHumanoid=yield this._import(t)})}_import(t){return dt(this,null,function*(){let e=yield this._v1Import(t);if(e)return e;let n=yield this._v0Import(t);return n||null})}_v1Import(t){return dt(this,null,function*(){var e,n;let i=this.parser.json;if(!(((e=i.extensionsUsed)==null?void 0:e.indexOf("VRMC_vrm"))!==-1))return null;let s=(n=i.extensions)==null?void 0:n.VRMC_vrm;if(!s)return null;let o=s.specVersion;if(!NA.has(o))return console.warn(`VRMHumanoidLoaderPlugin: Unknown VRMC_vrm specVersion "${o}"`),null;let a=s.humanoid;if(!a)return null;let l=a.humanBones.leftThumbIntermediate!=null||a.humanBones.rightThumbIntermediate!=null,c={};a.humanBones!=null&&(yield Promise.all(Object.entries(a.humanBones).map(h=>dt(this,[h],function*([d,f]){let g=d,_=f.node;if(l){let p=kv[g];p!=null&&(g=p)}let m=yield this.parser.getDependency("node",_);if(m==null){console.warn(`A glTF node bound to the humanoid bone ${g} (index = ${_}) does not exist`);return}c[g]={node:m}}))));let u=new Bv(this._ensureRequiredBonesExist(c),{autoUpdateHumanBones:this.autoUpdateHumanBones});if(t.scene.add(u.normalizedHumanBonesRoot),this.helperRoot){let h=new Ov(u);this.helperRoot.add(h),h.renderOrder=this.helperRoot.renderOrder}return u})}_v0Import(t){return dt(this,null,function*(){var e;let i=(e=this.parser.json.extensions)==null?void 0:e.VRM;if(!i)return null;let r=i.humanoid;if(!r)return null;let s={};r.humanBones!=null&&(yield Promise.all(r.humanBones.map(a=>dt(this,null,function*(){let l=a.bone,c=a.node;if(l==null||c==null)return;let u=yield this.parser.getDependency("node",c);if(u==null){console.warn(`A glTF node bound to the humanoid bone ${l} (index = ${c}) does not exist`);return}let h=kv[l],d=h??l;if(s[d]!=null){console.warn(`Multiple bone entries for ${d} detected (index = ${c}), ignoring duplicated entries.`);return}s[d]={node:u}}))));let o=new Bv(this._ensureRequiredBonesExist(s),{autoUpdateHumanBones:this.autoUpdateHumanBones});if(t.scene.add(o.normalizedHumanBonesRoot),this.helperRoot){let a=new Ov(o);this.helperRoot.add(a),a.renderOrder=this.helperRoot.renderOrder}return o})}_ensureRequiredBonesExist(t){let e=Object.values(UA).filter(n=>t[n]==null);if(e.length>0)throw new Error(`VRMHumanoidLoaderPlugin: These humanoid bones are required but not exist: ${e.join(", ")}`);return t}},Hv=class extends ht{constructor(){super(),this._currentTheta=0,this._currentRadius=0,this.theta=0,this.radius=0,this._currentTheta=0,this._currentRadius=0,this._attrPos=new Ge(new Float32Array(65*3),3),this.setAttribute("position",this._attrPos),this._attrIndex=new Ge(new Uint16Array(3*63),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let t=!1;this._currentTheta!==this.theta&&(this._currentTheta=this.theta,t=!0),this._currentRadius!==this.radius&&(this._currentRadius=this.radius,t=!0),t&&this._buildPosition()}_buildPosition(){this._attrPos.setXYZ(0,0,0,0);for(let t=0;t<64;t++){let e=t/63*this._currentTheta;this._attrPos.setXYZ(t+1,this._currentRadius*Math.sin(e),0,this._currentRadius*Math.cos(e))}this._attrPos.needsUpdate=!0}_buildIndex(){for(let t=0;t<63;t++)this._attrIndex.setXYZ(t*3,0,t+1,t+2);this._attrIndex.needsUpdate=!0}},OA=class extends ht{constructor(){super(),this.radius=0,this._currentRadius=0,this.tail=new w,this._currentTail=new w,this._attrPos=new Ge(new Float32Array(294),3),this.setAttribute("position",this._attrPos),this._attrIndex=new Ge(new Uint16Array(194),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let t=!1;this._currentRadius!==this.radius&&(this._currentRadius=this.radius,t=!0),this._currentTail.equals(this.tail)||(this._currentTail.copy(this.tail),t=!0),t&&this._buildPosition()}_buildPosition(){for(let t=0;t<32;t++){let e=t/16*Math.PI;this._attrPos.setXYZ(t,Math.cos(e),Math.sin(e),0),this._attrPos.setXYZ(32+t,0,Math.cos(e),Math.sin(e)),this._attrPos.setXYZ(64+t,Math.sin(e),0,Math.cos(e))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.setXYZ(96,0,0,0),this._attrPos.setXYZ(97,this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let t=0;t<32;t++){let e=(t+1)%32;this._attrIndex.setXY(t*2,t,e),this._attrIndex.setXY(64+t*2,32+t,32+e),this._attrIndex.setXY(128+t*2,64+t,64+e)}this._attrIndex.setXY(192,96,97),this._attrIndex.needsUpdate=!0}},ih=new he,Vv=new he,wl=new w,zv=new w,Gv=Math.sqrt(2)/2,FA=new he(0,0,-Gv,Gv),BA=new w(0,1,0),kA=class extends kt{constructor(t){super(),this.matrixAutoUpdate=!1,this.vrmLookAt=t;{let e=new Hv;e.radius=.5;let n=new Ln({color:65280,transparent:!0,opacity:.5,side:Sn,depthTest:!1,depthWrite:!1});this._meshPitch=new jt(e,n),this.add(this._meshPitch)}{let e=new Hv;e.radius=.5;let n=new Ln({color:16711680,transparent:!0,opacity:.5,side:Sn,depthTest:!1,depthWrite:!1});this._meshYaw=new jt(e,n),this.add(this._meshYaw)}{let e=new OA;e.radius=.1;let n=new En({color:16777215,depthTest:!1,depthWrite:!1});this._lineTarget=new si(e,n),this._lineTarget.frustumCulled=!1,this.add(this._lineTarget)}}dispose(){this._meshYaw.geometry.dispose(),this._meshYaw.material.dispose(),this._meshPitch.geometry.dispose(),this._meshPitch.material.dispose(),this._lineTarget.geometry.dispose(),this._lineTarget.material.dispose()}updateMatrixWorld(t){let e=gt.DEG2RAD*this.vrmLookAt.yaw;this._meshYaw.geometry.theta=e,this._meshYaw.geometry.update();let n=gt.DEG2RAD*this.vrmLookAt.pitch;this._meshPitch.geometry.theta=n,this._meshPitch.geometry.update(),this.vrmLookAt.getLookAtWorldPosition(wl),this.vrmLookAt.getLookAtWorldQuaternion(ih),ih.multiply(this.vrmLookAt.getFaceFrontQuaternion(Vv)),this._meshYaw.position.copy(wl),this._meshYaw.quaternion.copy(ih),this._meshPitch.position.copy(wl),this._meshPitch.quaternion.copy(ih),this._meshPitch.quaternion.multiply(Vv.setFromAxisAngle(BA,e)),this._meshPitch.quaternion.multiply(FA);let{target:i,autoUpdate:r}=this.vrmLookAt;i!=null&&r&&(i.getWorldPosition(zv).sub(wl),this._lineTarget.geometry.tail.copy(zv),this._lineTarget.geometry.update(),this._lineTarget.position.copy(wl)),super.updateMatrixWorld(t)}},HA=new w,VA=new w;function Qp(t,e){return t.matrixWorld.decompose(HA,e,VA),e}function oh(t){return[Math.atan2(-t.z,t.x),Math.atan2(t.y,Math.sqrt(t.x*t.x+t.z*t.z))]}function Wv(t){let e=Math.round(t/2/Math.PI);return t-2*Math.PI*e}var Xv=new w(0,0,1),zA=new w,GA=new w,WA=new w,XA=new he,Vp=new he,qv=new he,qA=new he,zp=new ln,yx=class Mx{constructor(e,n){this.offsetFromHeadBone=new w,this.autoUpdate=!0,this.faceFront=new w(0,0,1),this.humanoid=e,this.applier=n,this._yaw=0,this._pitch=0,this._needsUpdate=!0,this._restHeadWorldQuaternion=this.getLookAtWorldQuaternion(new he)}get yaw(){return this._yaw}set yaw(e){this._yaw=e,this._needsUpdate=!0}get pitch(){return this._pitch}set pitch(e){this._pitch=e,this._needsUpdate=!0}get euler(){return console.warn("VRMLookAt: euler is deprecated. use getEuler() instead."),this.getEuler(new ln)}getEuler(e){return e.set(gt.DEG2RAD*this._pitch,gt.DEG2RAD*this._yaw,0,"YXZ")}copy(e){if(this.humanoid!==e.humanoid)throw new Error("VRMLookAt: humanoid must be same in order to copy");return this.offsetFromHeadBone.copy(e.offsetFromHeadBone),this.applier=e.applier,this.autoUpdate=e.autoUpdate,this.target=e.target,this.faceFront.copy(e.faceFront),this}clone(){return new Mx(this.humanoid,this.applier).copy(this)}reset(){this._yaw=0,this._pitch=0,this._needsUpdate=!0}getLookAtWorldPosition(e){let n=this.humanoid.getRawBoneNode("head");return e.copy(this.offsetFromHeadBone).applyMatrix4(n.matrixWorld)}getLookAtWorldQuaternion(e){let n=this.humanoid.getRawBoneNode("head");return Qp(n,e)}getFaceFrontQuaternion(e){if(this.faceFront.distanceToSquared(Xv)<.01)return e.copy(this._restHeadWorldQuaternion).invert();let[n,i]=oh(this.faceFront);return zp.set(0,.5*Math.PI+n,i,"YZX"),e.setFromEuler(zp).premultiply(qA.copy(this._restHeadWorldQuaternion).invert())}getLookAtWorldDirection(e){return this.getLookAtWorldQuaternion(Vp),this.getFaceFrontQuaternion(qv),e.copy(Xv).applyQuaternion(Vp).applyQuaternion(qv).applyEuler(this.getEuler(zp))}lookAt(e){let n=XA.copy(this._restHeadWorldQuaternion).multiply(_x(this.getLookAtWorldQuaternion(Vp))),i=this.getLookAtWorldPosition(GA),r=WA.copy(e).sub(i).applyQuaternion(n).normalize(),[s,o]=oh(this.faceFront),[a,l]=oh(r),c=Wv(a-s),u=Wv(o-l);this._yaw=gt.RAD2DEG*c,this._pitch=gt.RAD2DEG*u,this._needsUpdate=!0}update(e){this.target!=null&&this.autoUpdate&&this.lookAt(this.target.getWorldPosition(zA)),this._needsUpdate&&(this._needsUpdate=!1,this.applier.applyYawPitch(this._yaw,this._pitch))}};yx.EULER_ORDER="YXZ";var YA=yx,$A=new w(0,0,1),qi=new he,Xo=new he,li=new ln(0,0,0,"YXZ"),ah=class{constructor(t,e,n,i,r){this.humanoid=t,this.rangeMapHorizontalInner=e,this.rangeMapHorizontalOuter=n,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r,this.faceFront=new w(0,0,1),this._restQuatLeftEye=new he,this._restQuatRightEye=new he,this._restLeftEyeParentWorldQuat=new he,this._restRightEyeParentWorldQuat=new he;let s=this.humanoid.getRawBoneNode("leftEye"),o=this.humanoid.getRawBoneNode("rightEye");s&&(this._restQuatLeftEye.copy(s.quaternion),Qp(s.parent,this._restLeftEyeParentWorldQuat)),o&&(this._restQuatRightEye.copy(o.quaternion),Qp(o.parent,this._restRightEyeParentWorldQuat))}applyYawPitch(t,e){let n=this.humanoid.getRawBoneNode("leftEye"),i=this.humanoid.getRawBoneNode("rightEye"),r=this.humanoid.getNormalizedBoneNode("leftEye"),s=this.humanoid.getNormalizedBoneNode("rightEye");n&&(e<0?li.x=-gt.DEG2RAD*this.rangeMapVerticalDown.map(-e):li.x=gt.DEG2RAD*this.rangeMapVerticalUp.map(e),t<0?li.y=-gt.DEG2RAD*this.rangeMapHorizontalInner.map(-t):li.y=gt.DEG2RAD*this.rangeMapHorizontalOuter.map(t),qi.setFromEuler(li),this._getWorldFaceFrontQuat(Xo),r.quaternion.copy(Xo).multiply(qi).multiply(Xo.invert()),qi.copy(this._restLeftEyeParentWorldQuat),n.quaternion.copy(r.quaternion).multiply(qi).premultiply(qi.invert()).multiply(this._restQuatLeftEye)),i&&(e<0?li.x=-gt.DEG2RAD*this.rangeMapVerticalDown.map(-e):li.x=gt.DEG2RAD*this.rangeMapVerticalUp.map(e),t<0?li.y=-gt.DEG2RAD*this.rangeMapHorizontalOuter.map(-t):li.y=gt.DEG2RAD*this.rangeMapHorizontalInner.map(t),qi.setFromEuler(li),this._getWorldFaceFrontQuat(Xo),s.quaternion.copy(Xo).multiply(qi).multiply(Xo.invert()),qi.copy(this._restRightEyeParentWorldQuat),i.quaternion.copy(s.quaternion).multiply(qi).premultiply(qi.invert()).multiply(this._restQuatRightEye))}lookAt(t){console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");let e=gt.RAD2DEG*t.y,n=gt.RAD2DEG*t.x;this.applyYawPitch(e,n)}_getWorldFaceFrontQuat(t){if(this.faceFront.distanceToSquared($A)<.01)return t.identity();let[e,n]=oh(this.faceFront);return li.set(0,.5*Math.PI+e,n,"YZX"),t.setFromEuler(li)}};ah.type="bone";var em=class{constructor(t,e,n,i,r){this.expressions=t,this.rangeMapHorizontalInner=e,this.rangeMapHorizontalOuter=n,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r}applyYawPitch(t,e){e<0?(this.expressions.setValue("lookDown",0),this.expressions.setValue("lookUp",this.rangeMapVerticalUp.map(-e))):(this.expressions.setValue("lookUp",0),this.expressions.setValue("lookDown",this.rangeMapVerticalDown.map(e))),t<0?(this.expressions.setValue("lookLeft",0),this.expressions.setValue("lookRight",this.rangeMapHorizontalOuter.map(-t))):(this.expressions.setValue("lookRight",0),this.expressions.setValue("lookLeft",this.rangeMapHorizontalOuter.map(t)))}lookAt(t){console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");let e=gt.RAD2DEG*t.y,n=gt.RAD2DEG*t.x;this.applyYawPitch(e,n)}};em.type="expression";var Yv=class{constructor(t,e){this.inputMaxValue=t,this.outputScale=e}map(t){return this.outputScale*cx(t/this.inputMaxValue)}},jA=new Set(["1.0","1.0-beta"]),rh=.01,ZA=class{get name(){return"VRMLookAtLoaderPlugin"}constructor(t,e){this.parser=t,this.helperRoot=e?.helperRoot}afterRoot(t){return dt(this,null,function*(){let e=t.userData.vrmHumanoid;if(e===null)return;if(e===void 0)throw new Error("VRMLookAtLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");let n=t.userData.vrmExpressionManager;if(n!==null){if(n===void 0)throw new Error("VRMLookAtLoaderPlugin: vrmExpressionManager is undefined. VRMExpressionLoaderPlugin have to be used first");t.userData.vrmLookAt=yield this._import(t,e,n)}})}_import(t,e,n){return dt(this,null,function*(){if(e==null||n==null)return null;let i=yield this._v1Import(t,e,n);if(i)return i;let r=yield this._v0Import(t,e,n);return r||null})}_v1Import(t,e,n){return dt(this,null,function*(){var i,r,s;let o=this.parser.json;if(!(((i=o.extensionsUsed)==null?void 0:i.indexOf("VRMC_vrm"))!==-1))return null;let l=(r=o.extensions)==null?void 0:r.VRMC_vrm;if(!l)return null;let c=l.specVersion;if(!jA.has(c))return console.warn(`VRMLookAtLoaderPlugin: Unknown VRMC_vrm specVersion "${c}"`),null;let u=l.lookAt;if(!u)return null;let h=u.type==="expression"?1:10,d=this._v1ImportRangeMap(u.rangeMapHorizontalInner,h),f=this._v1ImportRangeMap(u.rangeMapHorizontalOuter,h),g=this._v1ImportRangeMap(u.rangeMapVerticalDown,h),_=this._v1ImportRangeMap(u.rangeMapVerticalUp,h),m;u.type==="expression"?m=new em(n,d,f,g,_):m=new ah(e,d,f,g,_);let p=this._importLookAt(e,m);return p.offsetFromHeadBone.fromArray((s=u.offsetFromHeadBone)!=null?s:[0,.06,0]),p})}_v1ImportRangeMap(t,e){var n,i;let r=(n=t?.inputMaxValue)!=null?n:90,s=(i=t?.outputScale)!=null?i:e;return r<rh&&(console.warn("VRMLookAtLoaderPlugin: inputMaxValue of a range map is too small. Consider reviewing the range map!"),r=rh),new Yv(r,s)}_v0Import(t,e,n){return dt(this,null,function*(){var i,r,s,o;let l=(i=this.parser.json.extensions)==null?void 0:i.VRM;if(!l)return null;let c=l.firstPerson;if(!c)return null;let u=c.lookAtTypeName==="BlendShape"?1:10,h=this._v0ImportDegreeMap(c.lookAtHorizontalInner,u),d=this._v0ImportDegreeMap(c.lookAtHorizontalOuter,u),f=this._v0ImportDegreeMap(c.lookAtVerticalDown,u),g=this._v0ImportDegreeMap(c.lookAtVerticalUp,u),_;c.lookAtTypeName==="BlendShape"?_=new em(n,h,d,f,g):_=new ah(e,h,d,f,g);let m=this._importLookAt(e,_);return c.firstPersonBoneOffset?m.offsetFromHeadBone.set((r=c.firstPersonBoneOffset.x)!=null?r:0,(s=c.firstPersonBoneOffset.y)!=null?s:.06,-((o=c.firstPersonBoneOffset.z)!=null?o:0)):m.offsetFromHeadBone.set(0,.06,0),m.faceFront.set(0,0,-1),_ instanceof ah&&_.faceFront.set(0,0,-1),m})}_v0ImportDegreeMap(t,e){var n,i;let r=t?.curve;JSON.stringify(r)!=="[0,0,0,1,1,1,1,0]"&&console.warn("Curves of LookAtDegreeMap defined in VRM 0.0 are not supported");let s=(n=t?.xRange)!=null?n:90,o=(i=t?.yRange)!=null?i:e;return s<rh&&(console.warn("VRMLookAtLoaderPlugin: xRange of a degree map is too small. Consider reviewing the degree map!"),s=rh),new Yv(s,o)}_importLookAt(t,e){let n=new YA(t,e);if(this.helperRoot){let i=new kA(n);this.helperRoot.add(i),i.renderOrder=this.helperRoot.renderOrder}return n}};function KA(t,e){return typeof t!="string"||t===""?"":(/^https?:\/\//i.test(e)&&/^\//.test(t)&&(e=e.replace(/(^https?:\/\/[^/]+).*/i,"$1")),/^(https?:)?\/\//i.test(t)||/^data:.*,.*$/i.test(t)||/^blob:.*$/i.test(t)?t:e+t)}var JA=new Set(["1.0","1.0-beta"]),QA=class{get name(){return"VRMMetaLoaderPlugin"}constructor(t,e){var n,i,r;this.parser=t,this.needThumbnailImage=(n=e?.needThumbnailImage)!=null?n:!1,this.acceptLicenseUrls=(i=e?.acceptLicenseUrls)!=null?i:["https://vrm.dev/licenses/1.0/"],this.acceptV0Meta=(r=e?.acceptV0Meta)!=null?r:!0}afterRoot(t){return dt(this,null,function*(){t.userData.vrmMeta=yield this._import(t)})}_import(t){return dt(this,null,function*(){let e=yield this._v1Import(t);if(e!=null)return e;let n=yield this._v0Import(t);return n??null})}_v1Import(t){return dt(this,null,function*(){var e,n,i;let r=this.parser.json;if(!(((e=r.extensionsUsed)==null?void 0:e.indexOf("VRMC_vrm"))!==-1))return null;let o=(n=r.extensions)==null?void 0:n.VRMC_vrm;if(o==null)return null;let a=o.specVersion;if(!JA.has(a))return console.warn(`VRMMetaLoaderPlugin: Unknown VRMC_vrm specVersion "${a}"`),null;let l=o.meta;if(!l)return null;let c=l.licenseUrl;if(!new Set(this.acceptLicenseUrls).has(c))throw new Error(`VRMMetaLoaderPlugin: The license url "${c}" is not accepted`);let h;return this.needThumbnailImage&&l.thumbnailImage!=null&&(h=(i=yield this._extractGLTFImage(l.thumbnailImage))!=null?i:void 0),{metaVersion:"1",name:l.name,version:l.version,authors:l.authors,copyrightInformation:l.copyrightInformation,contactInformation:l.contactInformation,references:l.references,thirdPartyLicenses:l.thirdPartyLicenses,thumbnailImage:h,licenseUrl:l.licenseUrl,avatarPermission:l.avatarPermission,allowExcessivelyViolentUsage:l.allowExcessivelyViolentUsage,allowExcessivelySexualUsage:l.allowExcessivelySexualUsage,commercialUsage:l.commercialUsage,allowPoliticalOrReligiousUsage:l.allowPoliticalOrReligiousUsage,allowAntisocialOrHateUsage:l.allowAntisocialOrHateUsage,creditNotation:l.creditNotation,allowRedistribution:l.allowRedistribution,modification:l.modification,otherLicenseUrl:l.otherLicenseUrl}})}_v0Import(t){return dt(this,null,function*(){var e;let i=(e=this.parser.json.extensions)==null?void 0:e.VRM;if(!i)return null;let r=i.meta;if(!r)return null;if(!this.acceptV0Meta)throw new Error("VRMMetaLoaderPlugin: Attempted to load VRM0.0 meta but acceptV0Meta is false");let s;return this.needThumbnailImage&&r.texture!=null&&r.texture!==-1&&(s=yield this.parser.getDependency("texture",r.texture)),{metaVersion:"0",allowedUserName:r.allowedUserName,author:r.author,commercialUssageName:r.commercialUssageName,contactInformation:r.contactInformation,licenseName:r.licenseName,otherLicenseUrl:r.otherLicenseUrl,otherPermissionUrl:r.otherPermissionUrl,reference:r.reference,sexualUssageName:r.sexualUssageName,texture:s??void 0,title:r.title,version:r.version,violentUssageName:r.violentUssageName}})}_extractGLTFImage(t){return dt(this,null,function*(){var e;let i=(e=this.parser.json.images)==null?void 0:e[t];if(i==null)return console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${t}] of glTF as a thumbnail but the image doesn't exist`),null;let r=i.uri;if(i.bufferView!=null){let o=yield this.parser.getDependency("bufferView",i.bufferView),a=new Blob([o],{type:i.mimeType});r=URL.createObjectURL(a)}return r==null?(console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${t}] of glTF as a thumbnail but the image couldn't load properly`),null):yield new Lo().loadAsync(KA(r,this.parser.options.path)).catch(o=>(console.error(o),console.warn("VRMMetaLoaderPlugin: Failed to load a thumbnail image"),null))})}},e3=class{constructor(t){this.scene=t.scene,this.meta=t.meta,this.humanoid=t.humanoid,this.expressionManager=t.expressionManager,this.firstPerson=t.firstPerson,this.lookAt=t.lookAt}update(t){this.humanoid.update(),this.lookAt&&this.lookAt.update(t),this.expressionManager&&this.expressionManager.update()}};var t3=class extends e3{constructor(t){super(t),this.materials=t.materials,this.springBoneManager=t.springBoneManager,this.nodeConstraintManager=t.nodeConstraintManager}update(t){super.update(t),this.nodeConstraintManager&&this.nodeConstraintManager.update(),this.springBoneManager&&this.springBoneManager.update(t),this.materials&&this.materials.forEach(e=>{e.update&&e.update(t)})}},n3=Object.defineProperty,$v=Object.getOwnPropertySymbols,i3=Object.prototype.hasOwnProperty,r3=Object.prototype.propertyIsEnumerable,jv=(t,e,n)=>e in t?n3(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,Zv=(t,e)=>{for(var n in e||(e={}))i3.call(e,n)&&jv(t,n,e[n]);if($v)for(var n of $v(e))r3.call(e,n)&&jv(t,n,e[n]);return t},Ws=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())}),s3={"":3e3,srgb:3001};function o3(t,e){parseInt(Ai,10)>=152?t.colorSpace=e:t.encoding=s3[e]}var a3=class{get pending(){return Promise.all(this._pendings)}constructor(t,e){this._parser=t,this._materialParams=e,this._pendings=[]}assignPrimitive(t,e){e!=null&&(this._materialParams[t]=e)}assignColor(t,e,n){e!=null&&(this._materialParams[t]=new xe().fromArray(e),n&&this._materialParams[t].convertSRGBToLinear())}assignTexture(t,e,n){return Ws(this,null,function*(){let i=Ws(this,null,function*(){e!=null&&(yield this._parser.assignTexture(this._materialParams,t,e),n&&o3(this._materialParams[t],"srgb"))});return this._pendings.push(i),i})}assignTextureByIndex(t,e,n){return Ws(this,null,function*(){return this.assignTexture(t,e!=null?{index:e}:void 0,n)})}},l3=`// #define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif

#include <common>

// #include <uv_pars_vertex>
#ifdef MTOON_USE_UV
  varying vec2 vUv;

  // COMPAT: pre-r151 uses a common uvTransform
  #if THREE_VRM_THREE_REVISION < 151
    uniform mat3 uvTransform;
  #endif
#endif

// #include <uv2_pars_vertex>
// COMAPT: pre-r151 uses uv2 for lightMap and aoMap
#if THREE_VRM_THREE_REVISION < 151
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    attribute vec2 uv2;
    varying vec2 vUv2;
    uniform mat3 uv2Transform;
  #endif
#endif

// #include <displacementmap_pars_vertex>
// #include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
  uniform sampler2D outlineWidthMultiplyTexture;
  uniform mat3 outlineWidthMultiplyTextureUvTransform;
#endif

uniform float outlineWidthFactor;

void main() {

  // #include <uv_vertex>
  #ifdef MTOON_USE_UV
    // COMPAT: pre-r151 uses a common uvTransform
    #if THREE_VRM_THREE_REVISION >= 151
      vUv = uv;
    #else
      vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
    #endif
  #endif

  // #include <uv2_vertex>
  // COMAPT: pre-r151 uses uv2 for lightMap and aoMap
  #if THREE_VRM_THREE_REVISION < 151
    #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
      vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
    #endif
  #endif

  #include <color_vertex>

  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>

  // we need this to compute the outline properly
  objectNormal = normalize( objectNormal );

  #include <defaultnormal_vertex>

  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
    vNormal = normalize( transformedNormal );
  #endif

  #include <begin_vertex>

  #include <morphtarget_vertex>
  #include <skinning_vertex>
  // #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>

  vViewPosition = - mvPosition.xyz;

  #ifdef OUTLINE
    float worldNormalLength = length( transformedNormal );
    vec3 outlineOffset = outlineWidthFactor * worldNormalLength * objectNormal;

    #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
      vec2 outlineWidthMultiplyTextureUv = ( outlineWidthMultiplyTextureUvTransform * vec3( vUv, 1 ) ).xy;
      float outlineTex = texture2D( outlineWidthMultiplyTexture, outlineWidthMultiplyTextureUv ).g;
      outlineOffset *= outlineTex;
    #endif

    #ifdef OUTLINE_WIDTH_SCREEN
      outlineOffset *= vViewPosition.z / projectionMatrix[ 1 ].y;
    #endif

    gl_Position = projectionMatrix * modelViewMatrix * vec4( outlineOffset + transformed, 1.0 );

    gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic
  #endif

  #include <worldpos_vertex>
  // #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>

}`,c3=`// #define PHONG

uniform vec3 litFactor;

uniform float opacity;

uniform vec3 shadeColorFactor;
#ifdef USE_SHADEMULTIPLYTEXTURE
  uniform sampler2D shadeMultiplyTexture;
  uniform mat3 shadeMultiplyTextureUvTransform;
#endif

uniform float shadingShiftFactor;
uniform float shadingToonyFactor;

#ifdef USE_SHADINGSHIFTTEXTURE
  uniform sampler2D shadingShiftTexture;
  uniform mat3 shadingShiftTextureUvTransform;
  uniform float shadingShiftTextureScale;
#endif

uniform float giEqualizationFactor;

uniform vec3 parametricRimColorFactor;
#ifdef USE_RIMMULTIPLYTEXTURE
  uniform sampler2D rimMultiplyTexture;
  uniform mat3 rimMultiplyTextureUvTransform;
#endif
uniform float rimLightingMixFactor;
uniform float parametricRimFresnelPowerFactor;
uniform float parametricRimLiftFactor;

#ifdef USE_MATCAPTEXTURE
  uniform vec3 matcapFactor;
  uniform sampler2D matcapTexture;
  uniform mat3 matcapTextureUvTransform;
#endif

uniform vec3 emissive;
uniform float emissiveIntensity;

uniform vec3 outlineColorFactor;
uniform float outlineLightingMixFactor;

#ifdef USE_UVANIMATIONMASKTEXTURE
  uniform sampler2D uvAnimationMaskTexture;
  uniform mat3 uvAnimationMaskTextureUvTransform;
#endif

uniform float uvAnimationScrollXOffset;
uniform float uvAnimationScrollYOffset;
uniform float uvAnimationRotationPhase;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>

// #include <uv_pars_fragment>
#if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
  varying vec2 vUv;
#endif

// #include <uv2_pars_fragment>
// COMAPT: pre-r151 uses uv2 for lightMap and aoMap
#if THREE_VRM_THREE_REVISION < 151
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    varying vec2 vUv2;
  #endif
#endif

#include <map_pars_fragment>

#ifdef USE_MAP
  uniform mat3 mapUvTransform;
#endif

// #include <alphamap_pars_fragment>

#include <alphatest_pars_fragment>

#include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>

#ifdef USE_EMISSIVEMAP
  uniform mat3 emissiveMapUvTransform;
#endif

// #include <envmap_common_pars_fragment>
// #include <envmap_pars_fragment>
// #include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>

// #include <bsdfs>
// COMPAT: pre-r151 doesn't have BRDF_Lambert in <common>
#if THREE_VRM_THREE_REVISION < 151
  vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
    return RECIPROCAL_PI * diffuseColor;
  }
#endif

#include <lights_pars_begin>

#include <normal_pars_fragment>

// #include <lights_phong_pars_fragment>
varying vec3 vViewPosition;

struct MToonMaterial {
  vec3 diffuseColor;
  vec3 shadeColor;
  float shadingShift;
};

float linearstep( float a, float b, float t ) {
  return clamp( ( t - a ) / ( b - a ), 0.0, 1.0 );
}

/**
 * Convert NdotL into toon shading factor using shadingShift and shadingToony
 */
float getShading(
  const in float dotNL,
  const in float shadow,
  const in float shadingShift
) {
  float shading = dotNL;
  shading = shading + shadingShift;
  shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading );
  shading *= shadow;
  return shading;
}

/**
 * Mix diffuseColor and shadeColor using shading factor and light color
 */
vec3 getDiffuse(
  const in MToonMaterial material,
  const in float shading,
  in vec3 lightColor
) {
  #ifdef DEBUG_LITSHADERATE
    return vec3( BRDF_Lambert( shading * lightColor ) );
  #endif

  vec3 col = lightColor * BRDF_Lambert( mix( material.shadeColor, material.diffuseColor, shading ) );

  // The "comment out if you want to PBR absolutely" line
  #ifdef V0_COMPAT_SHADE
    col = min( col, material.diffuseColor );
  #endif

  return col;
}

// COMPAT: pre-r156 uses a struct GeometricContext
#if THREE_VRM_THREE_REVISION >= 157
  void RE_Direct_MToon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {
    float dotNL = clamp( dot( geometryNormal, directLight.direction ), -1.0, 1.0 );
    vec3 irradiance = directLight.color;

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;

    irradiance *= dotNL;

    float shading = getShading( dotNL, shadow, material.shadingShift );

    // toon shaded diffuse
    reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );
  }

  void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {
    // indirect diffuse will use diffuseColor, no shadeColor involved
    reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;
  }
#else
  void RE_Direct_MToon( const in IncidentLight directLight, const in GeometricContext geometry, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {
    float dotNL = clamp( dot( geometry.normal, directLight.direction ), -1.0, 1.0 );
    vec3 irradiance = directLight.color;

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;

    irradiance *= dotNL;

    float shading = getShading( dotNL, shadow, material.shadingShift );

    // toon shaded diffuse
    reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );
  }

  void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in GeometricContext geometry, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {
    // indirect diffuse will use diffuseColor, no shadeColor involved
    reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;
  }
#endif

#define RE_Direct RE_Direct_MToon
#define RE_IndirectDiffuse RE_IndirectDiffuse_MToon
#define Material_LightProbeLOD( material ) (0)

#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>

// #include <normalmap_pars_fragment>
#ifdef USE_NORMALMAP

  uniform sampler2D normalMap;
  uniform mat3 normalMapUvTransform;
  uniform vec2 normalScale;

#endif

// COMPAT: pre-r151
// USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151
#if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )

  uniform mat3 normalMatrix;

#endif

// COMPAT: pre-r151
// USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( TANGENTSPACE_NORMALMAP ) )

  // Per-Pixel Tangent Space Normal Mapping
  // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html

  // three-vrm specific change: it requires \`uv\` as an input in order to support uv scrolls

  // Temporary compat against shader change @ Three.js r126, r151
  #if THREE_VRM_THREE_REVISION >= 151

    mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {

      vec3 q0 = dFdx( eye_pos.xyz );
      vec3 q1 = dFdy( eye_pos.xyz );
      vec2 st0 = dFdx( uv.st );
      vec2 st1 = dFdy( uv.st );

      vec3 N = surf_norm;

      vec3 q1perp = cross( q1, N );
      vec3 q0perp = cross( N, q0 );

      vec3 T = q1perp * st0.x + q0perp * st1.x;
      vec3 B = q1perp * st0.y + q0perp * st1.y;

      float det = max( dot( T, T ), dot( B, B ) );
      float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );

      return mat3( T * scale, B * scale, N );

    }

  #else

    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {

      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
      vec2 st0 = dFdx( uv.st );
      vec2 st1 = dFdy( uv.st );

      vec3 N = normalize( surf_norm );

      vec3 q1perp = cross( q1, N );
      vec3 q0perp = cross( N, q0 );

      vec3 T = q1perp * st0.x + q0perp * st1.x;
      vec3 B = q1perp * st0.y + q0perp * st1.y;

      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0
      // TODO: Is this still required? Or shall I make a PR about it?
      if ( length( T ) == 0.0 || length( B ) == 0.0 ) {
        return surf_norm;
      }

      float det = max( dot( T, T ), dot( B, B ) );
      float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );

      return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );

    }

  #endif

#endif

// #include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// == post correction ==========================================================
void postCorrection() {
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}

// == main procedure ===========================================================
void main() {
  #include <clipping_planes_fragment>

  vec2 uv = vec2(0.5, 0.5);

  #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
    uv = vUv;

    float uvAnimMask = 1.0;
    #ifdef USE_UVANIMATIONMASKTEXTURE
      vec2 uvAnimationMaskTextureUv = ( uvAnimationMaskTextureUvTransform * vec3( uv, 1 ) ).xy;
      uvAnimMask = texture2D( uvAnimationMaskTexture, uvAnimationMaskTextureUv ).b;
    #endif

    float uvRotCos = cos( uvAnimationRotationPhase * uvAnimMask );
    float uvRotSin = sin( uvAnimationRotationPhase * uvAnimMask );
    uv = mat2( uvRotCos, -uvRotSin, uvRotSin, uvRotCos ) * ( uv - 0.5 ) + 0.5;
    uv = uv + vec2( uvAnimationScrollXOffset, uvAnimationScrollYOffset ) * uvAnimMask;
  #endif

  #ifdef DEBUG_UV
    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
      gl_FragColor = vec4( uv, 0.0, 1.0 );
    #endif
    return;
  #endif

  vec4 diffuseColor = vec4( litFactor, opacity );
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive * emissiveIntensity;

  #include <logdepthbuf_fragment>

  // #include <map_fragment>
  #ifdef USE_MAP
    vec2 mapUv = ( mapUvTransform * vec3( uv, 1 ) ).xy;
    vec4 sampledDiffuseColor = texture2D( map, mapUv );
    #ifdef DECODE_VIDEO_TEXTURE
      sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
    #endif
    diffuseColor *= sampledDiffuseColor;
  #endif

  // #include <color_fragment>
  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )
    diffuseColor.rgb *= vColor;
  #endif

  // #include <alphamap_fragment>

  #include <alphatest_fragment>

  // #include <specularmap_fragment>

  // #include <normal_fragment_begin>
  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;

  #ifdef FLAT_SHADED

    vec3 fdx = dFdx( vViewPosition );
    vec3 fdy = dFdy( vViewPosition );
    vec3 normal = normalize( cross( fdx, fdy ) );

  #else

    vec3 normal = normalize( vNormal );

    #ifdef DOUBLE_SIDED

      normal *= faceDirection;

    #endif

  #endif

  #ifdef USE_NORMALMAP

    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;

  #endif

  #ifdef USE_NORMALMAP_TANGENTSPACE

    #ifdef USE_TANGENT

      mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

    #else

      mat3 tbn = getTangentFrame( - vViewPosition, normal, normalMapUv );

    #endif

    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

      tbn[0] *= faceDirection;
      tbn[1] *= faceDirection;

    #endif

  #endif

  #ifdef USE_CLEARCOAT_NORMALMAP

    #ifdef USE_TANGENT

      mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

    #else

      mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );

    #endif

    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

      tbn2[0] *= faceDirection;
      tbn2[1] *= faceDirection;

    #endif

  #endif

  // non perturbed normal for clearcoat among others

  vec3 nonPerturbedNormal = normal;

  #ifdef OUTLINE
    normal *= -1.0;
  #endif

  // #include <normal_fragment_maps>

  // COMPAT: pre-r151
  // USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151
  #if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )

    normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

    #ifdef FLIP_SIDED

      normal = - normal;

    #endif

    #ifdef DOUBLE_SIDED

      normal = normal * faceDirection;

    #endif

    normal = normalize( normalMatrix * normal );

  // COMPAT: pre-r151
  // USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151
  #elif defined( USE_NORMALMAP_TANGENTSPACE ) || defined( TANGENTSPACE_NORMALMAP )

    vec3 mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale;

    // COMPAT: pre-r151
    #if THREE_VRM_THREE_REVISION >= 151 || defined( USE_TANGENT )

      normal = normalize( tbn * mapN );

    #else

      normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN, faceDirection );

    #endif

  #endif

  // #include <emissivemap_fragment>
  #ifdef USE_EMISSIVEMAP
    vec2 emissiveMapUv = ( emissiveMapUvTransform * vec3( uv, 1 ) ).xy;
    totalEmissiveRadiance *= texture2D( emissiveMap, emissiveMapUv ).rgb;
  #endif

  #ifdef DEBUG_NORMAL
    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );
    return;
  #endif

  // -- MToon: lighting --------------------------------------------------------
  // accumulation
  // #include <lights_phong_fragment>
  MToonMaterial material;

  material.diffuseColor = diffuseColor.rgb;

  material.shadeColor = shadeColorFactor;
  #ifdef USE_SHADEMULTIPLYTEXTURE
    vec2 shadeMultiplyTextureUv = ( shadeMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;
    material.shadeColor *= texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv ).rgb;
  #endif

  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )
    material.shadeColor.rgb *= vColor;
  #endif

  material.shadingShift = shadingShiftFactor;
  #ifdef USE_SHADINGSHIFTTEXTURE
    vec2 shadingShiftTextureUv = ( shadingShiftTextureUvTransform * vec3( uv, 1 ) ).xy;
    material.shadingShift += texture2D( shadingShiftTexture, shadingShiftTextureUv ).r * shadingShiftTextureScale;
  #endif

  // #include <lights_fragment_begin>

  // MToon Specific changes:
  // Since we want to take shadows into account of shading instead of irradiance,
  // we had to modify the codes that multiplies the results of shadowmap into color of direct lights.

  // COMPAT: pre-r156 uses a struct GeometricContext
  #if THREE_VRM_THREE_REVISION >= 157
    vec3 geometryPosition = - vViewPosition;
    vec3 geometryNormal = normal;
    vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

    vec3 geometryClearcoatNormal;

    #ifdef USE_CLEARCOAT

      geometryClearcoatNormal = clearcoatNormal;

    #endif
  #else
    GeometricContext geometry;

    geometry.position = - vViewPosition;
    geometry.normal = normal;
    geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

    #ifdef USE_CLEARCOAT

      geometry.clearcoatNormal = clearcoatNormal;

    #endif
  #endif

  IncidentLight directLight;

  // since these variables will be used in unrolled loop, we have to define in prior
  float shadow;

  #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

    PointLight pointLight;
    #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
    PointLightShadow pointLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

      pointLight = pointLights[ i ];

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        getPointLightInfo( pointLight, geometryPosition, directLight );
      #else
        getPointLightInfo( pointLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
      pointLightShadow = pointLightShadows[ i ];
      // COMPAT: pre-r166
      // r166 introduced shadowIntensity
      #if THREE_VRM_THREE_REVISION >= 166
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
      #else
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
      #endif
      #endif

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );
      #else
        RE_Direct( directLight, geometry, material, shadow, reflectedLight );
      #endif

    }
    #pragma unroll_loop_end

  #endif

  #if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

    SpotLight spotLight;
    #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
    SpotLightShadow spotLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

      spotLight = spotLights[ i ];

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        getSpotLightInfo( spotLight, geometryPosition, directLight );
      #else
        getSpotLightInfo( spotLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
      spotLightShadow = spotLightShadows[ i ];
      // COMPAT: pre-r166
      // r166 introduced shadowIntensity
      #if THREE_VRM_THREE_REVISION >= 166
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
      #else
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
      #endif
      #endif

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );
      #else
        RE_Direct( directLight, geometry, material, shadow, reflectedLight );
      #endif

    }
    #pragma unroll_loop_end

  #endif

  #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

    DirectionalLight directionalLight;
    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
    DirectionalLightShadow directionalLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

      directionalLight = directionalLights[ i ];

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        getDirectionalLightInfo( directionalLight, directLight );
      #else
        getDirectionalLightInfo( directionalLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
      directionalLightShadow = directionalLightShadows[ i ];
      // COMPAT: pre-r166
      // r166 introduced shadowIntensity
      #if THREE_VRM_THREE_REVISION >= 166
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
      #else
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
      #endif
      #endif

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );
      #else
        RE_Direct( directLight, geometry, material, shadow, reflectedLight );
      #endif

    }
    #pragma unroll_loop_end

  #endif

  // #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

  //   RectAreaLight rectAreaLight;

  //   #pragma unroll_loop_start
  //   for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

  //     rectAreaLight = rectAreaLights[ i ];
  //     RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );

  //   }
  //   #pragma unroll_loop_end

  // #endif

  #if defined( RE_IndirectDiffuse )

    vec3 iblIrradiance = vec3( 0.0 );

    vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

    // COMPAT: pre-r156 uses a struct GeometricContext
    // COMPAT: pre-r156 doesn't have a define USE_LIGHT_PROBES
    #if THREE_VRM_THREE_REVISION >= 157
      #if defined( USE_LIGHT_PROBES )
        irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
      #endif
    #else
      irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
    #endif

    #if ( NUM_HEMI_LIGHTS > 0 )

      #pragma unroll_loop_start
      for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

        // COMPAT: pre-r156 uses a struct GeometricContext
        #if THREE_VRM_THREE_REVISION >= 157
          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
        #else
          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
        #endif

      }
      #pragma unroll_loop_end

    #endif

  #endif

  // #if defined( RE_IndirectSpecular )

  //   vec3 radiance = vec3( 0.0 );
  //   vec3 clearcoatRadiance = vec3( 0.0 );

  // #endif

  #include <lights_fragment_maps>
  #include <lights_fragment_end>

  // modulation
  #include <aomap_fragment>

  vec3 col = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

  #ifdef DEBUG_LITSHADERATE
    gl_FragColor = vec4( col, diffuseColor.a );
    postCorrection();
    return;
  #endif

  // -- MToon: rim lighting -----------------------------------------
  vec3 viewDir = normalize( vViewPosition );

  #ifndef PHYSICALLY_CORRECT_LIGHTS
    reflectedLight.directSpecular /= PI;
  #endif
  vec3 rimMix = mix( vec3( 1.0 ), reflectedLight.directSpecular, 1.0 );

  vec3 rim = parametricRimColorFactor * pow( saturate( 1.0 - dot( viewDir, normal ) + parametricRimLiftFactor ), parametricRimFresnelPowerFactor );

  #ifdef USE_MATCAPTEXTURE
    {
      vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );
      vec3 y = cross( viewDir, x ); // guaranteed to be normalized
      vec2 sphereUv = 0.5 + 0.5 * vec2( dot( x, normal ), -dot( y, normal ) );
      sphereUv = ( matcapTextureUvTransform * vec3( sphereUv, 1 ) ).xy;
      vec3 matcap = texture2D( matcapTexture, sphereUv ).rgb;
      rim += matcapFactor * matcap;
    }
  #endif

  #ifdef USE_RIMMULTIPLYTEXTURE
    vec2 rimMultiplyTextureUv = ( rimMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;
    rim *= texture2D( rimMultiplyTexture, rimMultiplyTextureUv ).rgb;
  #endif

  col += rimMix * rim;

  // -- MToon: Emission --------------------------------------------------------
  col += totalEmissiveRadiance;

  // #include <envmap_fragment>

  // -- Almost done! -----------------------------------------------------------
  #if defined( OUTLINE )
    col = outlineColorFactor.rgb * mix( vec3( 1.0 ), col, outlineLightingMixFactor );
  #endif

  #ifdef OPAQUE
    diffuseColor.a = 1.0;
  #endif

  gl_FragColor = vec4( col, diffuseColor.a );
  postCorrection();
}
`,u3={None:"none",Normal:"normal",LitShadeRate:"litShadeRate",UV:"uv"},Kv={None:"none",WorldCoordinates:"worldCoordinates",ScreenCoordinates:"screenCoordinates"},h3={3e3:"",3001:"srgb"};function Gp(t){return parseInt(Ai,10)>=152?t.colorSpace:h3[t.encoding]}var d3=class extends qn{constructor(t={}){var e;super({vertexShader:l3,fragmentShader:c3}),this.uvAnimationScrollXSpeedFactor=0,this.uvAnimationScrollYSpeedFactor=0,this.uvAnimationRotationSpeedFactor=0,this.fog=!0,this.normalMapType=El,this._ignoreVertexColor=!0,this._v0CompatShade=!1,this._debugMode=u3.None,this._outlineWidthMode=Kv.None,this._isOutline=!1,t.transparentWithZWrite&&(t.depthWrite=!0),delete t.transparentWithZWrite,t.fog=!0,t.lights=!0,t.clipping=!0,this.uniforms=Yu.merge([se.common,se.normalmap,se.emissivemap,se.fog,se.lights,{litFactor:{value:new xe(1,1,1)},mapUvTransform:{value:new Ue},colorAlpha:{value:1},normalMapUvTransform:{value:new Ue},shadeColorFactor:{value:new xe(0,0,0)},shadeMultiplyTexture:{value:null},shadeMultiplyTextureUvTransform:{value:new Ue},shadingShiftFactor:{value:0},shadingShiftTexture:{value:null},shadingShiftTextureUvTransform:{value:new Ue},shadingShiftTextureScale:{value:1},shadingToonyFactor:{value:.9},giEqualizationFactor:{value:.9},matcapFactor:{value:new xe(1,1,1)},matcapTexture:{value:null},matcapTextureUvTransform:{value:new Ue},parametricRimColorFactor:{value:new xe(0,0,0)},rimMultiplyTexture:{value:null},rimMultiplyTextureUvTransform:{value:new Ue},rimLightingMixFactor:{value:1},parametricRimFresnelPowerFactor:{value:5},parametricRimLiftFactor:{value:0},emissive:{value:new xe(0,0,0)},emissiveIntensity:{value:1},emissiveMapUvTransform:{value:new Ue},outlineWidthMultiplyTexture:{value:null},outlineWidthMultiplyTextureUvTransform:{value:new Ue},outlineWidthFactor:{value:0},outlineColorFactor:{value:new xe(0,0,0)},outlineLightingMixFactor:{value:1},uvAnimationMaskTexture:{value:null},uvAnimationMaskTextureUvTransform:{value:new Ue},uvAnimationScrollXOffset:{value:0},uvAnimationScrollYOffset:{value:0},uvAnimationRotationPhase:{value:0}},(e=t.uniforms)!=null?e:{}]),this.setValues(t),this._uploadUniformsWorkaround(),this.customProgramCacheKey=()=>[...Object.entries(this._generateDefines()).map(([n,i])=>`${n}:${i}`),this.matcapTexture?`matcapTextureColorSpace:${Gp(this.matcapTexture)}`:"",this.shadeMultiplyTexture?`shadeMultiplyTextureColorSpace:${Gp(this.shadeMultiplyTexture)}`:"",this.rimMultiplyTexture?`rimMultiplyTextureColorSpace:${Gp(this.rimMultiplyTexture)}`:""].join(","),this.onBeforeCompile=n=>{let i=parseInt(Ai,10),r=Object.entries(Zv(Zv({},this._generateDefines()),this.defines)).filter(([s,o])=>!!o).map(([s,o])=>`#define ${s} ${o}`).join(`
`)+`
`;n.vertexShader=r+n.vertexShader,n.fragmentShader=r+n.fragmentShader,i<154&&(n.fragmentShader=n.fragmentShader.replace("#include <colorspace_fragment>","#include <encodings_fragment>"))}}get color(){return this.uniforms.litFactor.value}set color(t){this.uniforms.litFactor.value=t}get map(){return this.uniforms.map.value}set map(t){this.uniforms.map.value=t}get normalMap(){return this.uniforms.normalMap.value}set normalMap(t){this.uniforms.normalMap.value=t}get normalScale(){return this.uniforms.normalScale.value}set normalScale(t){this.uniforms.normalScale.value=t}get emissive(){return this.uniforms.emissive.value}set emissive(t){this.uniforms.emissive.value=t}get emissiveIntensity(){return this.uniforms.emissiveIntensity.value}set emissiveIntensity(t){this.uniforms.emissiveIntensity.value=t}get emissiveMap(){return this.uniforms.emissiveMap.value}set emissiveMap(t){this.uniforms.emissiveMap.value=t}get shadeColorFactor(){return this.uniforms.shadeColorFactor.value}set shadeColorFactor(t){this.uniforms.shadeColorFactor.value=t}get shadeMultiplyTexture(){return this.uniforms.shadeMultiplyTexture.value}set shadeMultiplyTexture(t){this.uniforms.shadeMultiplyTexture.value=t}get shadingShiftFactor(){return this.uniforms.shadingShiftFactor.value}set shadingShiftFactor(t){this.uniforms.shadingShiftFactor.value=t}get shadingShiftTexture(){return this.uniforms.shadingShiftTexture.value}set shadingShiftTexture(t){this.uniforms.shadingShiftTexture.value=t}get shadingShiftTextureScale(){return this.uniforms.shadingShiftTextureScale.value}set shadingShiftTextureScale(t){this.uniforms.shadingShiftTextureScale.value=t}get shadingToonyFactor(){return this.uniforms.shadingToonyFactor.value}set shadingToonyFactor(t){this.uniforms.shadingToonyFactor.value=t}get giEqualizationFactor(){return this.uniforms.giEqualizationFactor.value}set giEqualizationFactor(t){this.uniforms.giEqualizationFactor.value=t}get matcapFactor(){return this.uniforms.matcapFactor.value}set matcapFactor(t){this.uniforms.matcapFactor.value=t}get matcapTexture(){return this.uniforms.matcapTexture.value}set matcapTexture(t){this.uniforms.matcapTexture.value=t}get parametricRimColorFactor(){return this.uniforms.parametricRimColorFactor.value}set parametricRimColorFactor(t){this.uniforms.parametricRimColorFactor.value=t}get rimMultiplyTexture(){return this.uniforms.rimMultiplyTexture.value}set rimMultiplyTexture(t){this.uniforms.rimMultiplyTexture.value=t}get rimLightingMixFactor(){return this.uniforms.rimLightingMixFactor.value}set rimLightingMixFactor(t){this.uniforms.rimLightingMixFactor.value=t}get parametricRimFresnelPowerFactor(){return this.uniforms.parametricRimFresnelPowerFactor.value}set parametricRimFresnelPowerFactor(t){this.uniforms.parametricRimFresnelPowerFactor.value=t}get parametricRimLiftFactor(){return this.uniforms.parametricRimLiftFactor.value}set parametricRimLiftFactor(t){this.uniforms.parametricRimLiftFactor.value=t}get outlineWidthMultiplyTexture(){return this.uniforms.outlineWidthMultiplyTexture.value}set outlineWidthMultiplyTexture(t){this.uniforms.outlineWidthMultiplyTexture.value=t}get outlineWidthFactor(){return this.uniforms.outlineWidthFactor.value}set outlineWidthFactor(t){this.uniforms.outlineWidthFactor.value=t}get outlineColorFactor(){return this.uniforms.outlineColorFactor.value}set outlineColorFactor(t){this.uniforms.outlineColorFactor.value=t}get outlineLightingMixFactor(){return this.uniforms.outlineLightingMixFactor.value}set outlineLightingMixFactor(t){this.uniforms.outlineLightingMixFactor.value=t}get uvAnimationMaskTexture(){return this.uniforms.uvAnimationMaskTexture.value}set uvAnimationMaskTexture(t){this.uniforms.uvAnimationMaskTexture.value=t}get uvAnimationScrollXOffset(){return this.uniforms.uvAnimationScrollXOffset.value}set uvAnimationScrollXOffset(t){this.uniforms.uvAnimationScrollXOffset.value=t}get uvAnimationScrollYOffset(){return this.uniforms.uvAnimationScrollYOffset.value}set uvAnimationScrollYOffset(t){this.uniforms.uvAnimationScrollYOffset.value=t}get uvAnimationRotationPhase(){return this.uniforms.uvAnimationRotationPhase.value}set uvAnimationRotationPhase(t){this.uniforms.uvAnimationRotationPhase.value=t}get ignoreVertexColor(){return this._ignoreVertexColor}set ignoreVertexColor(t){this._ignoreVertexColor=t,this.needsUpdate=!0}get v0CompatShade(){return this._v0CompatShade}set v0CompatShade(t){this._v0CompatShade=t,this.needsUpdate=!0}get debugMode(){return this._debugMode}set debugMode(t){this._debugMode=t,this.needsUpdate=!0}get outlineWidthMode(){return this._outlineWidthMode}set outlineWidthMode(t){this._outlineWidthMode=t,this.needsUpdate=!0}get isOutline(){return this._isOutline}set isOutline(t){this._isOutline=t,this.needsUpdate=!0}get isMToonMaterial(){return!0}update(t){this._uploadUniformsWorkaround(),this._updateUVAnimation(t)}copy(t){return super.copy(t),this.map=t.map,this.normalMap=t.normalMap,this.emissiveMap=t.emissiveMap,this.shadeMultiplyTexture=t.shadeMultiplyTexture,this.shadingShiftTexture=t.shadingShiftTexture,this.matcapTexture=t.matcapTexture,this.rimMultiplyTexture=t.rimMultiplyTexture,this.outlineWidthMultiplyTexture=t.outlineWidthMultiplyTexture,this.uvAnimationMaskTexture=t.uvAnimationMaskTexture,this.normalMapType=t.normalMapType,this.uvAnimationScrollXSpeedFactor=t.uvAnimationScrollXSpeedFactor,this.uvAnimationScrollYSpeedFactor=t.uvAnimationScrollYSpeedFactor,this.uvAnimationRotationSpeedFactor=t.uvAnimationRotationSpeedFactor,this.ignoreVertexColor=t.ignoreVertexColor,this.v0CompatShade=t.v0CompatShade,this.debugMode=t.debugMode,this.outlineWidthMode=t.outlineWidthMode,this.isOutline=t.isOutline,this.needsUpdate=!0,this}_updateUVAnimation(t){this.uniforms.uvAnimationScrollXOffset.value+=t*this.uvAnimationScrollXSpeedFactor,this.uniforms.uvAnimationScrollYOffset.value+=t*this.uvAnimationScrollYSpeedFactor,this.uniforms.uvAnimationRotationPhase.value+=t*this.uvAnimationRotationSpeedFactor,this.uniforms.alphaTest.value=this.alphaTest,this.uniformsNeedUpdate=!0}_uploadUniformsWorkaround(){this.uniforms.opacity.value=this.opacity,this._updateTextureMatrix(this.uniforms.map,this.uniforms.mapUvTransform),this._updateTextureMatrix(this.uniforms.normalMap,this.uniforms.normalMapUvTransform),this._updateTextureMatrix(this.uniforms.emissiveMap,this.uniforms.emissiveMapUvTransform),this._updateTextureMatrix(this.uniforms.shadeMultiplyTexture,this.uniforms.shadeMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.shadingShiftTexture,this.uniforms.shadingShiftTextureUvTransform),this._updateTextureMatrix(this.uniforms.matcapTexture,this.uniforms.matcapTextureUvTransform),this._updateTextureMatrix(this.uniforms.rimMultiplyTexture,this.uniforms.rimMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.outlineWidthMultiplyTexture,this.uniforms.outlineWidthMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.uvAnimationMaskTexture,this.uniforms.uvAnimationMaskTextureUvTransform),this.uniformsNeedUpdate=!0}_generateDefines(){let t=parseInt(Ai,10),e=this.outlineWidthMultiplyTexture!==null,n=this.map!==null||this.normalMap!==null||this.emissiveMap!==null||this.shadeMultiplyTexture!==null||this.shadingShiftTexture!==null||this.rimMultiplyTexture!==null||this.uvAnimationMaskTexture!==null;return{THREE_VRM_THREE_REVISION:t,OUTLINE:this._isOutline,MTOON_USE_UV:e||n,MTOON_UVS_VERTEX_ONLY:e&&!n,V0_COMPAT_SHADE:this._v0CompatShade,USE_SHADEMULTIPLYTEXTURE:this.shadeMultiplyTexture!==null,USE_SHADINGSHIFTTEXTURE:this.shadingShiftTexture!==null,USE_MATCAPTEXTURE:this.matcapTexture!==null,USE_RIMMULTIPLYTEXTURE:this.rimMultiplyTexture!==null,USE_OUTLINEWIDTHMULTIPLYTEXTURE:this._isOutline&&this.outlineWidthMultiplyTexture!==null,USE_UVANIMATIONMASKTEXTURE:this.uvAnimationMaskTexture!==null,IGNORE_VERTEX_COLOR:this._ignoreVertexColor===!0,DEBUG_NORMAL:this._debugMode==="normal",DEBUG_LITSHADERATE:this._debugMode==="litShadeRate",DEBUG_UV:this._debugMode==="uv",OUTLINE_WIDTH_SCREEN:this._isOutline&&this._outlineWidthMode===Kv.ScreenCoordinates}}_updateTextureMatrix(t,e){t.value&&(t.value.matrixAutoUpdate&&t.value.updateMatrix(),e.value.copy(t.value.matrix))}},f3=new Set(["1.0","1.0-beta"]),Ex=class lh{get name(){return lh.EXTENSION_NAME}constructor(e,n={}){var i,r,s,o;this.parser=e,this.materialType=(i=n.materialType)!=null?i:d3,this.renderOrderOffset=(r=n.renderOrderOffset)!=null?r:0,this.v0CompatShade=(s=n.v0CompatShade)!=null?s:!1,this.debugMode=(o=n.debugMode)!=null?o:"none",this._mToonMaterialSet=new Set}beforeRoot(){return Ws(this,null,function*(){this._removeUnlitExtensionIfMToonExists()})}afterRoot(e){return Ws(this,null,function*(){e.userData.vrmMToonMaterials=Array.from(this._mToonMaterialSet)})}getMaterialType(e){return this._getMToonExtension(e)?this.materialType:null}extendMaterialParams(e,n){let i=this._getMToonExtension(e);return i?this._extendMaterialParams(i,n):null}loadMesh(e){return Ws(this,null,function*(){var n;let i=this.parser,s=(n=i.json.meshes)==null?void 0:n[e];if(s==null)throw new Error(`MToonMaterialLoaderPlugin: Attempt to use meshes[${e}] of glTF but the mesh doesn't exist`);let o=s.primitives,a=yield i.loadMesh(e);if(o.length===1){let l=a,c=o[0].material;c!=null&&this._setupPrimitive(l,c)}else{let l=a;for(let c=0;c<o.length;c++){let u=l.children[c],h=o[c].material;h!=null&&this._setupPrimitive(u,h)}}return a})}_removeUnlitExtensionIfMToonExists(){let i=this.parser.json.materials;i?.map((r,s)=>{var o;this._getMToonExtension(s)&&((o=r.extensions)!=null&&o.KHR_materials_unlit)&&delete r.extensions.KHR_materials_unlit})}_getMToonExtension(e){var n,i;let o=(n=this.parser.json.materials)==null?void 0:n[e];if(o==null){console.warn(`MToonMaterialLoaderPlugin: Attempt to use materials[${e}] of glTF but the material doesn't exist`);return}let a=(i=o.extensions)==null?void 0:i[lh.EXTENSION_NAME];if(a==null)return;let l=a.specVersion;if(!f3.has(l)){console.warn(`MToonMaterialLoaderPlugin: Unknown ${lh.EXTENSION_NAME} specVersion "${l}"`);return}return a}_extendMaterialParams(e,n){return Ws(this,null,function*(){var i;delete n.metalness,delete n.roughness;let r=new a3(this.parser,n);r.assignPrimitive("transparentWithZWrite",e.transparentWithZWrite),r.assignColor("shadeColorFactor",e.shadeColorFactor),r.assignTexture("shadeMultiplyTexture",e.shadeMultiplyTexture,!0),r.assignPrimitive("shadingShiftFactor",e.shadingShiftFactor),r.assignTexture("shadingShiftTexture",e.shadingShiftTexture,!0),r.assignPrimitive("shadingShiftTextureScale",(i=e.shadingShiftTexture)==null?void 0:i.scale),r.assignPrimitive("shadingToonyFactor",e.shadingToonyFactor),r.assignPrimitive("giEqualizationFactor",e.giEqualizationFactor),r.assignColor("matcapFactor",e.matcapFactor),r.assignTexture("matcapTexture",e.matcapTexture,!0),r.assignColor("parametricRimColorFactor",e.parametricRimColorFactor),r.assignTexture("rimMultiplyTexture",e.rimMultiplyTexture,!0),r.assignPrimitive("rimLightingMixFactor",e.rimLightingMixFactor),r.assignPrimitive("parametricRimFresnelPowerFactor",e.parametricRimFresnelPowerFactor),r.assignPrimitive("parametricRimLiftFactor",e.parametricRimLiftFactor),r.assignPrimitive("outlineWidthMode",e.outlineWidthMode),r.assignPrimitive("outlineWidthFactor",e.outlineWidthFactor),r.assignTexture("outlineWidthMultiplyTexture",e.outlineWidthMultiplyTexture,!1),r.assignColor("outlineColorFactor",e.outlineColorFactor),r.assignPrimitive("outlineLightingMixFactor",e.outlineLightingMixFactor),r.assignTexture("uvAnimationMaskTexture",e.uvAnimationMaskTexture,!1),r.assignPrimitive("uvAnimationScrollXSpeedFactor",e.uvAnimationScrollXSpeedFactor),r.assignPrimitive("uvAnimationScrollYSpeedFactor",e.uvAnimationScrollYSpeedFactor),r.assignPrimitive("uvAnimationRotationSpeedFactor",e.uvAnimationRotationSpeedFactor),r.assignPrimitive("v0CompatShade",this.v0CompatShade),r.assignPrimitive("debugMode",this.debugMode),yield r.pending})}_setupPrimitive(e,n){let i=this._getMToonExtension(n);if(i){let r=this._parseRenderOrder(i);e.renderOrder=r+this.renderOrderOffset,this._generateOutline(e),this._addToMaterialSet(e);return}}_shouldGenerateOutline(e){return typeof e.outlineWidthMode=="string"&&e.outlineWidthMode!=="none"&&typeof e.outlineWidthFactor=="number"&&e.outlineWidthFactor>0}_generateOutline(e){let n=e.material;if(!(n instanceof mn)||!this._shouldGenerateOutline(n))return;e.material=[n];let i=n.clone();i.name+=" (Outline)",i.isOutline=!0,i.side=dn,e.material.push(i);let r=e.geometry,s=r.index?r.index.count:r.attributes.position.count/3;r.addGroup(0,s,0),r.addGroup(0,s,1)}_addToMaterialSet(e){let n=e.material,i=new Set;Array.isArray(n)?n.forEach(r=>i.add(r)):i.add(n);for(let r of i)this._mToonMaterialSet.add(r)}_parseRenderOrder(e){var n;return(e.transparentWithZWrite?0:19)+((n=e.renderQueueOffsetNumber)!=null?n:0)}};Ex.EXTENSION_NAME="VRMC_materials_mtoon";var p3=Ex,m3=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())}),Sx=class tm{get name(){return tm.EXTENSION_NAME}constructor(e){this.parser=e}extendMaterialParams(e,n){return m3(this,null,function*(){let i=this._getHDREmissiveMultiplierExtension(e);if(i==null)return;console.warn("VRMMaterialsHDREmissiveMultiplierLoaderPlugin: `VRMC_materials_hdr_emissiveMultiplier` is archived. Use `KHR_materials_emissive_strength` instead.");let r=i.emissiveMultiplier;n.emissiveIntensity=r})}_getHDREmissiveMultiplierExtension(e){var n,i;let o=(n=this.parser.json.materials)==null?void 0:n[e];if(o==null){console.warn(`VRMMaterialsHDREmissiveMultiplierLoaderPlugin: Attempt to use materials[${e}] of glTF but the material doesn't exist`);return}let a=(i=o.extensions)==null?void 0:i[tm.EXTENSION_NAME];if(a!=null)return a}};Sx.EXTENSION_NAME="VRMC_materials_hdr_emissiveMultiplier";var g3=Sx,_3=Object.defineProperty,v3=Object.defineProperties,x3=Object.getOwnPropertyDescriptors,Jv=Object.getOwnPropertySymbols,y3=Object.prototype.hasOwnProperty,M3=Object.prototype.propertyIsEnumerable,Qv=(t,e,n)=>e in t?_3(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,Yi=(t,e)=>{for(var n in e||(e={}))y3.call(e,n)&&Qv(t,n,e[n]);if(Jv)for(var n of Jv(e))M3.call(e,n)&&Qv(t,n,e[n]);return t},ex=(t,e)=>v3(t,x3(e)),E3=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())});function qo(t){return Math.pow(t,2.2)}var S3=class{get name(){return"VRMMaterialsV0CompatPlugin"}constructor(t){var e;this.parser=t,this._renderQueueMapTransparent=new Map,this._renderQueueMapTransparentZWrite=new Map;let n=this.parser.json;n.extensionsUsed=(e=n.extensionsUsed)!=null?e:[],n.extensionsUsed.indexOf("KHR_texture_transform")===-1&&n.extensionsUsed.push("KHR_texture_transform")}beforeRoot(){return E3(this,null,function*(){var t;let e=this.parser.json,n=(t=e.extensions)==null?void 0:t.VRM,i=n?.materialProperties;i&&(this._populateRenderQueueMap(i),i.forEach((r,s)=>{var o,a;let l=(o=e.materials)==null?void 0:o[s];if(l==null){console.warn(`VRMMaterialsV0CompatPlugin: Attempt to use materials[${s}] of glTF but the material doesn't exist`);return}if(r.shader==="VRM/MToon"){let c=this._parseV0MToonProperties(r,l);e.materials[s]=c}else if((a=r.shader)!=null&&a.startsWith("VRM/Unlit")){let c=this._parseV0UnlitProperties(r,l);e.materials[s]=c}else r.shader==="VRM_USE_GLTFSHADER"||console.warn(`VRMMaterialsV0CompatPlugin: Unknown shader: ${r.shader}`)}))})}_parseV0MToonProperties(t,e){var n,i,r,s,o,a,l,c,u,h,d,f,g,_,m,p,E,T,v,C,A,b,P,S,y,L,F,B,G,$,z,J,V,re,te,we,qe,ot,q,ne,ye,ae,Te,ce,fe,at,pt,Ze,I,At,$e,Je,_e,Ke,Ae;let ke=(i=(n=t.keywordMap)==null?void 0:n._ALPHABLEND_ON)!=null?i:!1,R=((r=t.floatProperties)==null?void 0:r._ZWrite)===1&&ke,x=this._v0ParseRenderQueue(t),D=(o=(s=t.keywordMap)==null?void 0:s._ALPHATEST_ON)!=null?o:!1,X=ke?"BLEND":D?"MASK":"OPAQUE",j=D?(l=(a=t.floatProperties)==null?void 0:a._Cutoff)!=null?l:.5:void 0,Ie=((u=(c=t.floatProperties)==null?void 0:c._CullMode)!=null?u:2)===0,ie=this._portTextureTransform(t),Me=((d=(h=t.vectorProperties)==null?void 0:h._Color)!=null?d:[1,1,1,1]).map((N,k)=>k===3?N:qo(N)),Re=(f=t.textureProperties)==null?void 0:f._MainTex,Z=Re!=null?{index:Re,extensions:Yi({},ie)}:void 0,de=(_=(g=t.floatProperties)==null?void 0:g._BumpScale)!=null?_:1,Fe=(m=t.textureProperties)==null?void 0:m._BumpMap,Oe=Fe!=null?{index:Fe,scale:de,extensions:Yi({},ie)}:void 0,oe=((E=(p=t.vectorProperties)==null?void 0:p._EmissionColor)!=null?E:[0,0,0,1]).map(qo),Ve=(T=t.textureProperties)==null?void 0:T._EmissionMap,U=Ve!=null?{index:Ve,extensions:Yi({},ie)}:void 0,le=((C=(v=t.vectorProperties)==null?void 0:v._ShadeColor)!=null?C:[.97,.81,.86,1]).map(qo),K=(A=t.textureProperties)==null?void 0:A._ShadeTexture,me=K!=null?{index:K,extensions:Yi({},ie)}:void 0,Q=(P=(b=t.floatProperties)==null?void 0:b._ShadeShift)!=null?P:0,Y=(y=(S=t.floatProperties)==null?void 0:S._ShadeToony)!=null?y:.9;Y=gt.lerp(Y,1,.5+.5*Q),Q=-Q-(1-Y);let ve=(F=(L=t.floatProperties)==null?void 0:L._IndirectLightIntensity)!=null?F:.1,We=ve?1-ve:void 0,xt=(B=t.textureProperties)==null?void 0:B._SphereAdd,mt=xt!=null?[1,1,1]:void 0,Hn=xt!=null?{index:xt}:void 0,xi=($=(G=t.floatProperties)==null?void 0:G._RimLightingMix)!=null?$:0,Pa=(z=t.textureProperties)==null?void 0:z._RimTexture,uc=Pa!=null?{index:Pa,extensions:Yi({},ie)}:void 0,rr=((V=(J=t.vectorProperties)==null?void 0:J._RimColor)!=null?V:[0,0,0,1]).map(qo),La=(te=(re=t.floatProperties)==null?void 0:re._RimFresnelPower)!=null?te:1,hc=(qe=(we=t.floatProperties)==null?void 0:we._RimLift)!=null?qe:0,dc=["none","worldCoordinates","screenCoordinates"][(q=(ot=t.floatProperties)==null?void 0:ot._OutlineWidthMode)!=null?q:0],Nr=(ye=(ne=t.floatProperties)==null?void 0:ne._OutlineWidth)!=null?ye:0;Nr=.01*Nr;let Ua=(ae=t.textureProperties)==null?void 0:ae._OutlineWidthTexture,to=Ua!=null?{index:Ua,extensions:Yi({},ie)}:void 0,fc=((ce=(Te=t.vectorProperties)==null?void 0:Te._OutlineColor)!=null?ce:[0,0,0]).map(qo),Nd=((at=(fe=t.floatProperties)==null?void 0:fe._OutlineColorMode)!=null?at:0)===1?(Ze=(pt=t.floatProperties)==null?void 0:pt._OutlineLightingMix)!=null?Ze:1:0,pc=(I=t.textureProperties)==null?void 0:I._UvAnimMaskTexture,Dd=pc!=null?{index:pc,extensions:Yi({},ie)}:void 0,Od=($e=(At=t.floatProperties)==null?void 0:At._UvAnimScrollX)!=null?$e:0,no=(_e=(Je=t.floatProperties)==null?void 0:Je._UvAnimScrollY)!=null?_e:0;no!=null&&(no=-no);let Fd=(Ae=(Ke=t.floatProperties)==null?void 0:Ke._UvAnimRotation)!=null?Ae:0,M={specVersion:"1.0",transparentWithZWrite:R,renderQueueOffsetNumber:x,shadeColorFactor:le,shadeMultiplyTexture:me,shadingShiftFactor:Q,shadingToonyFactor:Y,giEqualizationFactor:We,matcapFactor:mt,matcapTexture:Hn,rimLightingMixFactor:xi,rimMultiplyTexture:uc,parametricRimColorFactor:rr,parametricRimFresnelPowerFactor:La,parametricRimLiftFactor:hc,outlineWidthMode:dc,outlineWidthFactor:Nr,outlineWidthMultiplyTexture:to,outlineColorFactor:fc,outlineLightingMixFactor:Nd,uvAnimationMaskTexture:Dd,uvAnimationScrollXSpeedFactor:Od,uvAnimationScrollYSpeedFactor:no,uvAnimationRotationSpeedFactor:Fd};return ex(Yi({},e),{pbrMetallicRoughness:{baseColorFactor:Me,baseColorTexture:Z},normalTexture:Oe,emissiveTexture:U,emissiveFactor:oe,alphaMode:X,alphaCutoff:j,doubleSided:Ie,extensions:{VRMC_materials_mtoon:M}})}_parseV0UnlitProperties(t,e){var n,i,r,s,o;let a=t.shader==="VRM/UnlitTransparentZWrite",l=t.shader==="VRM/UnlitTransparent"||a,c=this._v0ParseRenderQueue(t),u=t.shader==="VRM/UnlitCutout",h=l?"BLEND":u?"MASK":"OPAQUE",d=u?(i=(n=t.floatProperties)==null?void 0:n._Cutoff)!=null?i:.5:void 0,f=this._portTextureTransform(t),g=((s=(r=t.vectorProperties)==null?void 0:r._Color)!=null?s:[1,1,1,1]).map(qo),_=(o=t.textureProperties)==null?void 0:o._MainTex,m=_!=null?{index:_,extensions:Yi({},f)}:void 0,p={specVersion:"1.0",transparentWithZWrite:a,renderQueueOffsetNumber:c,shadeColorFactor:g,shadeMultiplyTexture:m};return ex(Yi({},e),{pbrMetallicRoughness:{baseColorFactor:g,baseColorTexture:m},alphaMode:h,alphaCutoff:d,extensions:{VRMC_materials_mtoon:p}})}_portTextureTransform(t){var e,n,i,r,s;let o=(e=t.vectorProperties)==null?void 0:e._MainTex;if(o==null)return{};let a=[(n=o?.[0])!=null?n:0,(i=o?.[1])!=null?i:0],l=[(r=o?.[2])!=null?r:1,(s=o?.[3])!=null?s:1];return a[1]=1-l[1]-a[1],{KHR_texture_transform:{offset:a,scale:l}}}_v0ParseRenderQueue(t){var e,n;let i=t.shader==="VRM/UnlitTransparentZWrite",r=((e=t.keywordMap)==null?void 0:e._ALPHABLEND_ON)!=null||t.shader==="VRM/UnlitTransparent"||i,s=((n=t.floatProperties)==null?void 0:n._ZWrite)===1||i,o=0;if(r){let a=t.renderQueue;a!=null&&(s?o=this._renderQueueMapTransparentZWrite.get(a):o=this._renderQueueMapTransparent.get(a))}return o}_populateRenderQueueMap(t){let e=new Set,n=new Set;t.forEach(i=>{var r,s;let o=i.shader==="VRM/UnlitTransparentZWrite",a=((r=i.keywordMap)==null?void 0:r._ALPHABLEND_ON)!=null||i.shader==="VRM/UnlitTransparent"||o,l=((s=i.floatProperties)==null?void 0:s._ZWrite)===1||o;if(a){let c=i.renderQueue;c!=null&&(l?n.add(c):e.add(c))}}),e.size>10&&console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${e.size} render queues for Transparent materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`),n.size>10&&console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${n.size} render queues for TransparentZWrite materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`),Array.from(e).sort().forEach((i,r)=>{let s=Math.min(Math.max(r-e.size+1,-9),0);this._renderQueueMapTransparent.set(i,s)}),Array.from(n).sort().forEach((i,r)=>{let s=Math.min(Math.max(r,0),9);this._renderQueueMapTransparentZWrite.set(i,s)})}},tx=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())}),Yr=new w,Wp=class extends kt{constructor(t){super(),this._attrPosition=new Ge(new Float32Array([0,0,0,0,0,0]),3),this._attrPosition.setUsage(Hf);let e=new ht;e.setAttribute("position",this._attrPosition);let n=new En({color:16711935,depthTest:!1,depthWrite:!1});this._line=new fr(e,n),this.add(this._line),this.constraint=t}updateMatrixWorld(t){Yr.setFromMatrixPosition(this.constraint.destination.matrixWorld),this._attrPosition.setXYZ(0,Yr.x,Yr.y,Yr.z),this.constraint.source&&Yr.setFromMatrixPosition(this.constraint.source.matrixWorld),this._attrPosition.setXYZ(1,Yr.x,Yr.y,Yr.z),this._attrPosition.needsUpdate=!0,super.updateMatrixWorld(t)}};function nx(t,e){return e.set(t.elements[12],t.elements[13],t.elements[14])}var T3=new w,b3=new w;function w3(t,e){return t.decompose(T3,e,b3),e}function uh(t){return t.invert?t.invert():t.inverse(),t}var rm=class{constructor(t,e){this.destination=t,this.source=e,this.weight=1}},A3=new w,R3=new w,C3=new w,I3=new he,P3=new he,L3=new he,U3=class extends rm{get aimAxis(){return this._aimAxis}set aimAxis(t){this._aimAxis=t,this._v3AimAxis.set(t==="PositiveX"?1:t==="NegativeX"?-1:0,t==="PositiveY"?1:t==="NegativeY"?-1:0,t==="PositiveZ"?1:t==="NegativeZ"?-1:0)}get dependencies(){let t=new Set([this.source]);return this.destination.parent&&t.add(this.destination.parent),t}constructor(t,e){super(t,e),this._aimAxis="PositiveX",this._v3AimAxis=new w(1,0,0),this._dstRestQuat=new he}setInitState(){this._dstRestQuat.copy(this.destination.quaternion)}update(){this.destination.updateWorldMatrix(!0,!1),this.source.updateWorldMatrix(!0,!1);let t=I3.identity(),e=P3.identity();this.destination.parent&&(w3(this.destination.parent.matrixWorld,t),uh(e.copy(t)));let n=A3.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(t),i=nx(this.source.matrixWorld,R3).sub(nx(this.destination.matrixWorld,C3)).normalize(),r=L3.setFromUnitVectors(n,i).premultiply(e).multiply(t).multiply(this._dstRestQuat);this.destination.quaternion.copy(this._dstRestQuat).slerp(r,this.weight)}};function N3(t,e){let n=[t],i=t.parent;for(;i!==null;)n.unshift(i),i=i.parent;n.forEach(r=>{e(r)})}var D3=class{constructor(){this._constraints=new Set,this._objectConstraintsMap=new Map}get constraints(){return this._constraints}addConstraint(t){this._constraints.add(t);let e=this._objectConstraintsMap.get(t.destination);e==null&&(e=new Set,this._objectConstraintsMap.set(t.destination,e)),e.add(t)}deleteConstraint(t){this._constraints.delete(t),this._objectConstraintsMap.get(t.destination).delete(t)}setInitState(){let t=new Set,e=new Set;for(let n of this._constraints)this._processConstraint(n,t,e,i=>i.setInitState())}update(){let t=new Set,e=new Set;for(let n of this._constraints)this._processConstraint(n,t,e,i=>i.update())}_processConstraint(t,e,n,i){if(n.has(t))return;if(e.has(t))throw new Error("VRMNodeConstraintManager: Circular dependency detected while updating constraints");e.add(t);let r=t.dependencies;for(let s of r)N3(s,o=>{let a=this._objectConstraintsMap.get(o);if(a)for(let l of a)this._processConstraint(l,e,n,i)});i(t),n.add(t)}},O3=new he,F3=new he,B3=class extends rm{get dependencies(){return new Set([this.source])}constructor(t,e){super(t,e),this._dstRestQuat=new he,this._invSrcRestQuat=new he}setInitState(){this._dstRestQuat.copy(this.destination.quaternion),uh(this._invSrcRestQuat.copy(this.source.quaternion))}update(){let t=O3.copy(this._invSrcRestQuat).multiply(this.source.quaternion),e=F3.copy(this._dstRestQuat).multiply(t);this.destination.quaternion.copy(this._dstRestQuat).slerp(e,this.weight)}},k3=new w,H3=new he,V3=new he,z3=class extends rm{get rollAxis(){return this._rollAxis}set rollAxis(t){this._rollAxis=t,this._v3RollAxis.set(t==="X"?1:0,t==="Y"?1:0,t==="Z"?1:0)}get dependencies(){return new Set([this.source])}constructor(t,e){super(t,e),this._rollAxis="X",this._v3RollAxis=new w(1,0,0),this._dstRestQuat=new he,this._invDstRestQuat=new he,this._invSrcRestQuatMulDstRestQuat=new he}setInitState(){this._dstRestQuat.copy(this.destination.quaternion),uh(this._invDstRestQuat.copy(this._dstRestQuat)),uh(this._invSrcRestQuatMulDstRestQuat.copy(this.source.quaternion)).multiply(this._dstRestQuat)}update(){let t=H3.copy(this._invDstRestQuat).multiply(this.source.quaternion).multiply(this._invSrcRestQuatMulDstRestQuat),e=k3.copy(this._v3RollAxis).applyQuaternion(t),i=V3.setFromUnitVectors(e,this._v3RollAxis).premultiply(this._dstRestQuat).multiply(t);this.destination.quaternion.copy(this._dstRestQuat).slerp(i,this.weight)}},G3=new Set(["1.0","1.0-beta"]),Tx=class Il{get name(){return Il.EXTENSION_NAME}constructor(e,n){this.parser=e,this.helperRoot=n?.helperRoot}afterRoot(e){return tx(this,null,function*(){e.userData.vrmNodeConstraintManager=yield this._import(e)})}_import(e){return tx(this,null,function*(){var n;let i=this.parser.json;if(!(((n=i.extensionsUsed)==null?void 0:n.indexOf(Il.EXTENSION_NAME))!==-1))return null;let s=new D3,o=yield this.parser.getDependencies("node");return o.forEach((a,l)=>{var c;let u=i.nodes[l],h=(c=u?.extensions)==null?void 0:c[Il.EXTENSION_NAME];if(h==null)return;let d=h.specVersion;if(!G3.has(d)){console.warn(`VRMNodeConstraintLoaderPlugin: Unknown ${Il.EXTENSION_NAME} specVersion "${d}"`);return}let f=h.constraint;if(f.roll!=null){let g=this._importRollConstraint(a,o,f.roll);s.addConstraint(g)}else if(f.aim!=null){let g=this._importAimConstraint(a,o,f.aim);s.addConstraint(g)}else if(f.rotation!=null){let g=this._importRotationConstraint(a,o,f.rotation);s.addConstraint(g)}}),e.scene.updateMatrixWorld(),s.setInitState(),s})}_importRollConstraint(e,n,i){let{source:r,rollAxis:s,weight:o}=i,a=n[r],l=new z3(e,a);if(s!=null&&(l.rollAxis=s),o!=null&&(l.weight=o),this.helperRoot){let c=new Wp(l);this.helperRoot.add(c)}return l}_importAimConstraint(e,n,i){let{source:r,aimAxis:s,weight:o}=i,a=n[r],l=new U3(e,a);if(s!=null&&(l.aimAxis=s),o!=null&&(l.weight=o),this.helperRoot){let c=new Wp(l);this.helperRoot.add(c)}return l}_importRotationConstraint(e,n,i){let{source:r,weight:s}=i,o=n[r],a=new B3(e,o);if(s!=null&&(a.weight=s),this.helperRoot){let l=new Wp(a);this.helperRoot.add(l)}return a}};Tx.EXTENSION_NAME="VRMC_node_constraint";var W3=Tx,sh=(t,e,n)=>new Promise((i,r)=>{var s=l=>{try{a(n.next(l))}catch(c){r(c)}},o=l=>{try{a(n.throw(l))}catch(c){r(c)}},a=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,o);a((n=n.apply(t,e)).next())}),sm=class{},Xp=new w,Gs=new w,bx=class extends sm{get type(){return"capsule"}constructor(t){var e,n,i,r;super(),this.offset=(e=t?.offset)!=null?e:new w(0,0,0),this.tail=(n=t?.tail)!=null?n:new w(0,0,0),this.radius=(i=t?.radius)!=null?i:0,this.inside=(r=t?.inside)!=null?r:!1}calculateCollision(t,e,n,i){Xp.setFromMatrixPosition(t),Gs.subVectors(this.tail,this.offset).applyMatrix4(t),Gs.sub(Xp);let r=Gs.lengthSq();i.copy(e).sub(Xp);let s=Gs.dot(i);s<=0||(r<=s||Gs.multiplyScalar(s/r),i.sub(Gs));let o=i.length(),a=this.inside?this.radius-n-o:o-n-this.radius;return a<0&&(i.multiplyScalar(1/o),this.inside&&i.negate()),a}},qp=new w,ix=new Ue,wx=class extends sm{get type(){return"plane"}constructor(t){var e,n;super(),this.offset=(e=t?.offset)!=null?e:new w(0,0,0),this.normal=(n=t?.normal)!=null?n:new w(0,0,1)}calculateCollision(t,e,n,i){i.setFromMatrixPosition(t),i.negate().add(e),ix.getNormalMatrix(t),qp.copy(this.normal).applyNormalMatrix(ix).normalize();let r=i.dot(qp)-n;return i.copy(qp),r}},X3=new w,Ax=class extends sm{get type(){return"sphere"}constructor(t){var e,n,i;super(),this.offset=(e=t?.offset)!=null?e:new w(0,0,0),this.radius=(n=t?.radius)!=null?n:0,this.inside=(i=t?.inside)!=null?i:!1}calculateCollision(t,e,n,i){i.subVectors(e,X3.setFromMatrixPosition(t));let r=i.length(),s=this.inside?this.radius-n-r:r-n-this.radius;return s<0&&(i.multiplyScalar(1/r),this.inside&&i.negate()),s}},$i=new w,q3=class extends ht{constructor(t){super(),this.worldScale=1,this._currentRadius=0,this._currentOffset=new w,this._currentTail=new w,this._shape=t,this._attrPos=new Ge(new Float32Array(396),3),this.setAttribute("position",this._attrPos),this._attrIndex=new Ge(new Uint16Array(264),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let t=!1,e=this._shape.radius/this.worldScale;this._currentRadius!==e&&(this._currentRadius=e,t=!0),this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),t=!0);let n=$i.copy(this._shape.tail).divideScalar(this.worldScale);this._currentTail.distanceToSquared(n)>1e-10&&(this._currentTail.copy(n),t=!0),t&&this._buildPosition()}_buildPosition(){$i.copy(this._currentTail).sub(this._currentOffset);let t=$i.length()/this._currentRadius;for(let i=0;i<=16;i++){let r=i/16*Math.PI;this._attrPos.setXYZ(i,-Math.sin(r),-Math.cos(r),0),this._attrPos.setXYZ(17+i,t+Math.sin(r),Math.cos(r),0),this._attrPos.setXYZ(34+i,-Math.sin(r),0,-Math.cos(r)),this._attrPos.setXYZ(51+i,t+Math.sin(r),0,Math.cos(r))}for(let i=0;i<32;i++){let r=i/16*Math.PI;this._attrPos.setXYZ(68+i,0,Math.sin(r),Math.cos(r)),this._attrPos.setXYZ(100+i,t,Math.sin(r),Math.cos(r))}let e=Math.atan2($i.y,Math.sqrt($i.x*$i.x+$i.z*$i.z)),n=-Math.atan2($i.z,$i.x);this.rotateZ(e),this.rotateY(n),this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let t=0;t<34;t++){let e=(t+1)%34;this._attrIndex.setXY(t*2,t,e),this._attrIndex.setXY(68+t*2,34+t,34+e)}for(let t=0;t<32;t++){let e=(t+1)%32;this._attrIndex.setXY(136+t*2,68+t,68+e),this._attrIndex.setXY(200+t*2,100+t,100+e)}this._attrIndex.needsUpdate=!0}},Y3=class extends ht{constructor(t){super(),this.worldScale=1,this._currentOffset=new w,this._currentNormal=new w,this._shape=t,this._attrPos=new Ge(new Float32Array(6*3),3),this.setAttribute("position",this._attrPos),this._attrIndex=new Ge(new Uint16Array(10),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let t=!1;this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),t=!0),this._currentNormal.equals(this._shape.normal)||(this._currentNormal.copy(this._shape.normal),t=!0),t&&this._buildPosition()}_buildPosition(){this._attrPos.setXYZ(0,-.5,-.5,0),this._attrPos.setXYZ(1,.5,-.5,0),this._attrPos.setXYZ(2,.5,.5,0),this._attrPos.setXYZ(3,-.5,.5,0),this._attrPos.setXYZ(4,0,0,0),this._attrPos.setXYZ(5,0,0,.25),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this.lookAt(this._currentNormal),this._attrPos.needsUpdate=!0}_buildIndex(){this._attrIndex.setXY(0,0,1),this._attrIndex.setXY(2,1,2),this._attrIndex.setXY(4,2,3),this._attrIndex.setXY(6,3,0),this._attrIndex.setXY(8,4,5),this._attrIndex.needsUpdate=!0}},$3=class extends ht{constructor(t){super(),this.worldScale=1,this._currentRadius=0,this._currentOffset=new w,this._shape=t,this._attrPos=new Ge(new Float32Array(32*3*3),3),this.setAttribute("position",this._attrPos),this._attrIndex=new Ge(new Uint16Array(64*3),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let t=!1,e=this._shape.radius/this.worldScale;this._currentRadius!==e&&(this._currentRadius=e,t=!0),this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),t=!0),t&&this._buildPosition()}_buildPosition(){for(let t=0;t<32;t++){let e=t/16*Math.PI;this._attrPos.setXYZ(t,Math.cos(e),Math.sin(e),0),this._attrPos.setXYZ(32+t,0,Math.cos(e),Math.sin(e)),this._attrPos.setXYZ(64+t,Math.sin(e),0,Math.cos(e))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let t=0;t<32;t++){let e=(t+1)%32;this._attrIndex.setXY(t*2,t,e),this._attrIndex.setXY(64+t*2,32+t,32+e),this._attrIndex.setXY(128+t*2,64+t,64+e)}this._attrIndex.needsUpdate=!0}},j3=new w,Yp=class extends kt{constructor(t){if(super(),this.matrixAutoUpdate=!1,this.collider=t,this.collider.shape instanceof Ax)this._geometry=new $3(this.collider.shape);else if(this.collider.shape instanceof bx)this._geometry=new q3(this.collider.shape);else if(this.collider.shape instanceof wx)this._geometry=new Y3(this.collider.shape);else throw new Error("VRMSpringBoneColliderHelper: Unknown collider shape type detected");let e=new En({color:16711935,depthTest:!1,depthWrite:!1});this._line=new si(this._geometry,e),this.add(this._line)}dispose(){this._geometry.dispose()}updateMatrixWorld(t){this.collider.updateWorldMatrix(!0,!1),this.matrix.copy(this.collider.matrixWorld);let e=this.matrix.elements;this._geometry.worldScale=j3.set(e[0],e[1],e[2]).length(),this._geometry.update(),super.updateMatrixWorld(t)}},Z3=class extends ht{constructor(t){super(),this.worldScale=1,this._currentRadius=0,this._currentTail=new w,this._springBone=t,this._attrPos=new Ge(new Float32Array(294),3),this.setAttribute("position",this._attrPos),this._attrIndex=new Ge(new Uint16Array(194),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let t=!1,e=this._springBone.settings.hitRadius/this.worldScale;this._currentRadius!==e&&(this._currentRadius=e,t=!0),this._currentTail.equals(this._springBone.initialLocalChildPosition)||(this._currentTail.copy(this._springBone.initialLocalChildPosition),t=!0),t&&this._buildPosition()}_buildPosition(){for(let t=0;t<32;t++){let e=t/16*Math.PI;this._attrPos.setXYZ(t,Math.cos(e),Math.sin(e),0),this._attrPos.setXYZ(32+t,0,Math.cos(e),Math.sin(e)),this._attrPos.setXYZ(64+t,Math.sin(e),0,Math.cos(e))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.setXYZ(96,0,0,0),this._attrPos.setXYZ(97,this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let t=0;t<32;t++){let e=(t+1)%32;this._attrIndex.setXY(t*2,t,e),this._attrIndex.setXY(64+t*2,32+t,32+e),this._attrIndex.setXY(128+t*2,64+t,64+e)}this._attrIndex.setXY(192,96,97),this._attrIndex.needsUpdate=!0}},K3=new w,J3=class extends kt{constructor(t){super(),this.matrixAutoUpdate=!1,this.springBone=t,this._geometry=new Z3(this.springBone);let e=new En({color:16776960,depthTest:!1,depthWrite:!1});this._line=new si(this._geometry,e),this.add(this._line)}dispose(){this._geometry.dispose()}updateMatrixWorld(t){this.springBone.bone.updateWorldMatrix(!0,!1),this.matrix.copy(this.springBone.bone.matrixWorld);let e=this.matrix.elements;this._geometry.worldScale=K3.set(e[0],e[1],e[2]).length(),this._geometry.update(),super.updateMatrixWorld(t)}},$p=class extends _t{constructor(t){super(),this.colliderMatrix=new be,this.shape=t}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),Q3(this.colliderMatrix,this.matrixWorld,this.shape.offset)}};function Q3(t,e,n){let i=e.elements;t.copy(e),n&&(t.elements[12]=i[0]*n.x+i[4]*n.y+i[8]*n.z+i[12],t.elements[13]=i[1]*n.x+i[5]*n.y+i[9]*n.z+i[13],t.elements[14]=i[2]*n.x+i[6]*n.y+i[10]*n.z+i[14])}var eR=new be;function tR(t){return t.invert?t.invert():t.getInverse(eR.copy(t)),t}var nR=class{constructor(t){this._inverseCache=new be,this._shouldUpdateInverse=!0,this.matrix=t;let e={set:(n,i,r)=>(this._shouldUpdateInverse=!0,n[i]=r,!0)};this._originalElements=t.elements,t.elements=new Proxy(t.elements,e)}get inverse(){return this._shouldUpdateInverse&&(tR(this._inverseCache.copy(this.matrix)),this._shouldUpdateInverse=!1),this._inverseCache}revert(){this.matrix.elements=this._originalElements}},jp=new be,Yo=new w,Al=new w,Rl=new w,Cl=new w,iR=new be,rR=class{constructor(t,e,n={},i=[]){this._currentTail=new w,this._prevTail=new w,this._boneAxis=new w,this._worldSpaceBoneLength=0,this._center=null,this._initialLocalMatrix=new be,this._initialLocalRotation=new he,this._initialLocalChildPosition=new w;var r,s,o,a,l,c;this.bone=t,this.bone.matrixAutoUpdate=!1,this.child=e,this.settings={hitRadius:(r=n.hitRadius)!=null?r:0,stiffness:(s=n.stiffness)!=null?s:1,gravityPower:(o=n.gravityPower)!=null?o:0,gravityDir:(l=(a=n.gravityDir)==null?void 0:a.clone())!=null?l:new w(0,-1,0),dragForce:(c=n.dragForce)!=null?c:.4},this.colliderGroups=i}get dependencies(){let t=new Set,e=this.bone.parent;e&&t.add(e);for(let n=0;n<this.colliderGroups.length;n++)for(let i=0;i<this.colliderGroups[n].colliders.length;i++)t.add(this.colliderGroups[n].colliders[i]);return t}get center(){return this._center}set center(t){var e;(e=this._center)!=null&&e.userData.inverseCacheProxy&&(this._center.userData.inverseCacheProxy.revert(),delete this._center.userData.inverseCacheProxy),this._center=t,this._center&&(this._center.userData.inverseCacheProxy||(this._center.userData.inverseCacheProxy=new nR(this._center.matrixWorld)))}get initialLocalChildPosition(){return this._initialLocalChildPosition}get _parentMatrixWorld(){return this.bone.parent?this.bone.parent.matrixWorld:jp}setInitState(){this._initialLocalMatrix.copy(this.bone.matrix),this._initialLocalRotation.copy(this.bone.quaternion),this.child?this._initialLocalChildPosition.copy(this.child.position):this._initialLocalChildPosition.copy(this.bone.position).normalize().multiplyScalar(.07);let t=this._getMatrixWorldToCenter();this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(t),this._prevTail.copy(this._currentTail),this._boneAxis.copy(this._initialLocalChildPosition).normalize()}reset(){this.bone.quaternion.copy(this._initialLocalRotation),this.bone.updateMatrix(),this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld,this.bone.matrix);let t=this._getMatrixWorldToCenter();this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(t),this._prevTail.copy(this._currentTail)}update(t){if(t<=0)return;this._calcWorldSpaceBoneLength();let e=Al.copy(this._boneAxis).transformDirection(this._initialLocalMatrix).transformDirection(this._parentMatrixWorld);Cl.copy(this._currentTail).add(Yo.subVectors(this._currentTail,this._prevTail).multiplyScalar(1-this.settings.dragForce)).applyMatrix4(this._getMatrixCenterToWorld()).addScaledVector(e,this.settings.stiffness*t).addScaledVector(this.settings.gravityDir,this.settings.gravityPower*t),Rl.setFromMatrixPosition(this.bone.matrixWorld),Cl.sub(Rl).normalize().multiplyScalar(this._worldSpaceBoneLength).add(Rl),this._collision(Cl),this._prevTail.copy(this._currentTail),this._currentTail.copy(Cl).applyMatrix4(this._getMatrixWorldToCenter());let n=iR.multiplyMatrices(this._parentMatrixWorld,this._initialLocalMatrix).invert();this.bone.quaternion.setFromUnitVectors(this._boneAxis,Yo.copy(Cl).applyMatrix4(n).normalize()).premultiply(this._initialLocalRotation),this.bone.updateMatrix(),this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld,this.bone.matrix)}_collision(t){for(let e=0;e<this.colliderGroups.length;e++)for(let n=0;n<this.colliderGroups[e].colliders.length;n++){let i=this.colliderGroups[e].colliders[n],r=i.shape.calculateCollision(i.colliderMatrix,t,this.settings.hitRadius,Yo);if(r<0){t.addScaledVector(Yo,-r),t.sub(Rl);let s=t.length();t.multiplyScalar(this._worldSpaceBoneLength/s).add(Rl)}}}_calcWorldSpaceBoneLength(){Yo.setFromMatrixPosition(this.bone.matrixWorld),this.child?Al.setFromMatrixPosition(this.child.matrixWorld):(Al.copy(this._initialLocalChildPosition),Al.applyMatrix4(this.bone.matrixWorld)),this._worldSpaceBoneLength=Yo.sub(Al).length()}_getMatrixCenterToWorld(){return this._center?this._center.matrixWorld:jp}_getMatrixWorldToCenter(){return this._center?this._center.userData.inverseCacheProxy.inverse:jp}};function sR(t,e){let n=[],i=t;for(;i!==null;)n.unshift(i),i=i.parent;n.forEach(r=>{e(r)})}function nm(t,e){t.children.forEach(n=>{e(n)||nm(n,e)})}function oR(t){var e;let n=new Map;for(let i of t){let r=i;do{let s=((e=n.get(r))!=null?e:0)+1;if(s===t.size)return r;n.set(r,s),r=r.parent}while(r!==null)}return null}var rx=class{constructor(){this._joints=new Set,this._sortedJoints=[],this._hasWarnedCircularDependency=!1,this._ancestors=[],this._objectSpringBonesMap=new Map,this._isSortedJointsDirty=!1,this._relevantChildrenUpdated=this._relevantChildrenUpdated.bind(this)}get joints(){return this._joints}get springBones(){return console.warn("VRMSpringBoneManager: springBones is deprecated. use joints instead."),this._joints}get colliderGroups(){let t=new Set;return this._joints.forEach(e=>{e.colliderGroups.forEach(n=>{t.add(n)})}),Array.from(t)}get colliders(){let t=new Set;return this.colliderGroups.forEach(e=>{e.colliders.forEach(n=>{t.add(n)})}),Array.from(t)}addJoint(t){this._joints.add(t);let e=this._objectSpringBonesMap.get(t.bone);e==null&&(e=new Set,this._objectSpringBonesMap.set(t.bone,e)),e.add(t),this._isSortedJointsDirty=!0}addSpringBone(t){console.warn("VRMSpringBoneManager: addSpringBone() is deprecated. use addJoint() instead."),this.addJoint(t)}deleteJoint(t){this._joints.delete(t),this._objectSpringBonesMap.get(t.bone).delete(t),this._isSortedJointsDirty=!0}deleteSpringBone(t){console.warn("VRMSpringBoneManager: deleteSpringBone() is deprecated. use deleteJoint() instead."),this.deleteJoint(t)}setInitState(){this._sortJoints();for(let t=0;t<this._sortedJoints.length;t++){let e=this._sortedJoints[t];e.bone.updateMatrix(),e.bone.updateWorldMatrix(!1,!1),e.setInitState()}}reset(){this._sortJoints();for(let t=0;t<this._sortedJoints.length;t++){let e=this._sortedJoints[t];e.bone.updateMatrix(),e.bone.updateWorldMatrix(!1,!1),e.reset()}}update(t){this._sortJoints();for(let e=0;e<this._ancestors.length;e++)this._ancestors[e].updateWorldMatrix(e===0,!1);for(let e=0;e<this._sortedJoints.length;e++){let n=this._sortedJoints[e];n.bone.updateMatrix(),n.bone.updateWorldMatrix(!1,!1),n.update(t),nm(n.bone,this._relevantChildrenUpdated)}}_sortJoints(){if(!this._isSortedJointsDirty)return;let t=[],e=new Set,n=new Set,i=new Set;for(let s of this._joints)this._insertJointSort(s,e,n,t,i);this._sortedJoints=t;let r=oR(i);this._ancestors=[],r&&(this._ancestors.push(r),nm(r,s=>{var o,a;return((a=(o=this._objectSpringBonesMap.get(s))==null?void 0:o.size)!=null?a:0)>0?!0:(this._ancestors.push(s),!1)})),this._isSortedJointsDirty=!1}_insertJointSort(t,e,n,i,r){if(n.has(t))return;if(e.has(t)){this._hasWarnedCircularDependency||(console.warn("VRMSpringBoneManager: Circular dependency detected"),this._hasWarnedCircularDependency=!0);return}e.add(t);let s=t.dependencies;for(let o of s){let a=!1,l=null;sR(o,c=>{let u=this._objectSpringBonesMap.get(c);if(u)for(let h of u)a=!0,this._insertJointSort(h,e,n,i,r);else a||(l=c)}),l&&r.add(l)}i.push(t),n.add(t)}_relevantChildrenUpdated(t){var e,n;return((n=(e=this._objectSpringBonesMap.get(t))==null?void 0:e.size)!=null?n:0)>0?!0:(t.updateWorldMatrix(!1,!1),!1)}},sx="VRMC_springBone_extended_collider",aR=new Set(["1.0","1.0-beta"]),lR=new Set(["1.0"]),Rx=class jo{get name(){return jo.EXTENSION_NAME}constructor(e,n){var i;this.parser=e,this.jointHelperRoot=n?.jointHelperRoot,this.colliderHelperRoot=n?.colliderHelperRoot,this.useExtendedColliders=(i=n?.useExtendedColliders)!=null?i:!0}afterRoot(e){return sh(this,null,function*(){e.userData.vrmSpringBoneManager=yield this._import(e)})}_import(e){return sh(this,null,function*(){let n=yield this._v1Import(e);if(n!=null)return n;let i=yield this._v0Import(e);return i??null})}_v1Import(e){return sh(this,null,function*(){var n,i,r,s,o;let a=e.parser.json;if(!(((n=a.extensionsUsed)==null?void 0:n.indexOf(jo.EXTENSION_NAME))!==-1))return null;let c=new rx,u=yield e.parser.getDependencies("node"),h=(i=a.extensions)==null?void 0:i[jo.EXTENSION_NAME];if(!h)return null;let d=h.specVersion;if(!aR.has(d))return console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${jo.EXTENSION_NAME} specVersion "${d}"`),null;let f=(r=h.colliders)==null?void 0:r.map((_,m)=>{var p,E,T,v,C,A,b,P,S,y,L,F,B,G,$;let z=u[_.node];if(z==null)return console.warn(`VRMSpringBoneLoaderPlugin: The collider #${m} attempted to use the node #${_.node} but not found`),null;let J=_.shape,V=(p=_.extensions)==null?void 0:p[sx];if(this.useExtendedColliders&&V!=null){let re=V.specVersion;if(!lR.has(re))console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${sx} specVersion "${re}". Fallbacking to the ${jo.EXTENSION_NAME} definition`);else{let te=V.shape;if(te.sphere)return this._importSphereCollider(z,{offset:new w().fromArray((E=te.sphere.offset)!=null?E:[0,0,0]),radius:(T=te.sphere.radius)!=null?T:0,inside:(v=te.sphere.inside)!=null?v:!1});if(te.capsule)return this._importCapsuleCollider(z,{offset:new w().fromArray((C=te.capsule.offset)!=null?C:[0,0,0]),radius:(A=te.capsule.radius)!=null?A:0,tail:new w().fromArray((b=te.capsule.tail)!=null?b:[0,0,0]),inside:(P=te.capsule.inside)!=null?P:!1});if(te.plane)return this._importPlaneCollider(z,{offset:new w().fromArray((S=te.plane.offset)!=null?S:[0,0,0]),normal:new w().fromArray((y=te.plane.normal)!=null?y:[0,0,1])})}}if(J.sphere)return this._importSphereCollider(z,{offset:new w().fromArray((L=J.sphere.offset)!=null?L:[0,0,0]),radius:(F=J.sphere.radius)!=null?F:0,inside:!1});if(J.capsule)return this._importCapsuleCollider(z,{offset:new w().fromArray((B=J.capsule.offset)!=null?B:[0,0,0]),radius:(G=J.capsule.radius)!=null?G:0,tail:new w().fromArray(($=J.capsule.tail)!=null?$:[0,0,0]),inside:!1});throw new Error(`VRMSpringBoneLoaderPlugin: The collider #${m} has no valid shape`)}),g=(s=h.colliderGroups)==null?void 0:s.map((_,m)=>{var p;return{colliders:((p=_.colliders)!=null?p:[]).flatMap(T=>{let v=f?.[T];return v??(console.warn(`VRMSpringBoneLoaderPlugin: The colliderGroup #${m} attempted to use a collider #${T} but not found`),[])}),name:_.name}});return(o=h.springs)==null||o.forEach((_,m)=>{var p;let E=_.joints,T=(p=_.colliderGroups)==null?void 0:p.map(A=>{let b=g?.[A];if(b==null)throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${m} attempted to use a colliderGroup ${A} but not found`);return b}),v=_.center!=null?u[_.center]:void 0,C;E.forEach(A=>{if(C){let b=C.node,P=u[b],S=A.node,y=u[S],L={hitRadius:C.hitRadius,dragForce:C.dragForce,gravityPower:C.gravityPower,stiffness:C.stiffness,gravityDir:C.gravityDir!=null?new w().fromArray(C.gravityDir):void 0},F=this._importJoint(P,y,L,T);v&&(F.center=v),c.addJoint(F)}C=A})}),c.setInitState(),c})}_v0Import(e){return sh(this,null,function*(){var n,i,r;let s=e.parser.json;if(!(((n=s.extensionsUsed)==null?void 0:n.indexOf("VRM"))!==-1))return null;let a=(i=s.extensions)==null?void 0:i.VRM,l=a?.secondaryAnimation;if(!l)return null;let c=l?.boneGroups;if(!c)return null;let u=new rx,h=yield e.parser.getDependencies("node"),d=(r=l.colliderGroups)==null?void 0:r.map(f=>{var g;let _=h[f.node];return{colliders:((g=f.colliders)!=null?g:[]).map((p,E)=>{var T,v,C;let A=new w(0,0,0);return p.offset&&A.set((T=p.offset.x)!=null?T:0,(v=p.offset.y)!=null?v:0,p.offset.z?-p.offset.z:0),this._importSphereCollider(_,{offset:A,radius:(C=p.radius)!=null?C:0,inside:!1})})}});return c?.forEach((f,g)=>{let _=f.bones;_&&_.forEach(m=>{var p,E,T,v;let C=h[m],A=new w;f.gravityDir?A.set((p=f.gravityDir.x)!=null?p:0,(E=f.gravityDir.y)!=null?E:0,(T=f.gravityDir.z)!=null?T:0):A.set(0,-1,0);let b=f.center!=null?h[f.center]:void 0,P={hitRadius:f.hitRadius,dragForce:f.dragForce,gravityPower:f.gravityPower,stiffness:f.stiffiness,gravityDir:A},S=(v=f.colliderGroups)==null?void 0:v.map(y=>{let L=d?.[y];if(L==null)throw new Error(`VRMSpringBoneLoaderPlugin: The spring #${g} attempted to use a colliderGroup ${y} but not found`);return L});C.traverse(y=>{var L;let F=(L=y.children[0])!=null?L:null,B=this._importJoint(y,F,P,S);b&&(B.center=b),u.addJoint(B)})})}),e.scene.updateMatrixWorld(),u.setInitState(),u})}_importJoint(e,n,i,r){let s=new rR(e,n,i,r);if(this.jointHelperRoot){let o=new J3(s);this.jointHelperRoot.add(o),o.renderOrder=this.jointHelperRoot.renderOrder}return s}_importSphereCollider(e,n){let i=new Ax(n),r=new $p(i);if(e.add(r),this.colliderHelperRoot){let s=new Yp(r);this.colliderHelperRoot.add(s),s.renderOrder=this.colliderHelperRoot.renderOrder}return r}_importCapsuleCollider(e,n){let i=new bx(n),r=new $p(i);if(e.add(r),this.colliderHelperRoot){let s=new Yp(r);this.colliderHelperRoot.add(s),s.renderOrder=this.colliderHelperRoot.renderOrder}return r}_importPlaneCollider(e,n){let i=new wx(n),r=new $p(i);if(e.add(r),this.colliderHelperRoot){let s=new Yp(r);this.colliderHelperRoot.add(s),s.renderOrder=this.colliderHelperRoot.renderOrder}return r}};Rx.EXTENSION_NAME="VRMC_springBone";var cR=Rx,Cx=class{get name(){return"VRMLoaderPlugin"}constructor(t,e){var n,i,r,s,o,a,l,c,u,h;this.parser=t;let d=e?.helperRoot,f=e?.autoUpdateHumanBones;this.expressionPlugin=(n=e?.expressionPlugin)!=null?n:new wA(t),this.firstPersonPlugin=(i=e?.firstPersonPlugin)!=null?i:new RA(t),this.humanoidPlugin=(r=e?.humanoidPlugin)!=null?r:new DA(t,{helperRoot:d,autoUpdateHumanBones:f}),this.lookAtPlugin=(s=e?.lookAtPlugin)!=null?s:new ZA(t,{helperRoot:d}),this.metaPlugin=(o=e?.metaPlugin)!=null?o:new QA(t),this.mtoonMaterialPlugin=(a=e?.mtoonMaterialPlugin)!=null?a:new p3(t),this.materialsHDREmissiveMultiplierPlugin=(l=e?.materialsHDREmissiveMultiplierPlugin)!=null?l:new g3(t),this.materialsV0CompatPlugin=(c=e?.materialsV0CompatPlugin)!=null?c:new S3(t),this.springBonePlugin=(u=e?.springBonePlugin)!=null?u:new cR(t,{colliderHelperRoot:d,jointHelperRoot:d}),this.nodeConstraintPlugin=(h=e?.nodeConstraintPlugin)!=null?h:new W3(t,{helperRoot:d})}beforeRoot(){return nh(this,null,function*(){yield this.materialsV0CompatPlugin.beforeRoot(),yield this.mtoonMaterialPlugin.beforeRoot()})}loadMesh(t){return nh(this,null,function*(){return yield this.mtoonMaterialPlugin.loadMesh(t)})}getMaterialType(t){let e=this.mtoonMaterialPlugin.getMaterialType(t);return e??null}extendMaterialParams(t,e){return nh(this,null,function*(){yield this.materialsHDREmissiveMultiplierPlugin.extendMaterialParams(t,e),yield this.mtoonMaterialPlugin.extendMaterialParams(t,e)})}afterRoot(t){return nh(this,null,function*(){yield this.metaPlugin.afterRoot(t),yield this.humanoidPlugin.afterRoot(t),yield this.expressionPlugin.afterRoot(t),yield this.lookAtPlugin.afterRoot(t),yield this.firstPersonPlugin.afterRoot(t),yield this.springBonePlugin.afterRoot(t),yield this.nodeConstraintPlugin.afterRoot(t),yield this.mtoonMaterialPlugin.afterRoot(t);let e=t.userData.vrmMeta,n=t.userData.vrmHumanoid;if(e&&n){let i=new t3({scene:t.scene,expressionManager:t.userData.vrmExpressionManager,firstPerson:t.userData.vrmFirstPerson,humanoid:n,lookAt:t.userData.vrmLookAt,meta:e,materials:t.userData.vrmMToonMaterials,springBoneManager:t.userData.vrmSpringBoneManager,nodeConstraintManager:t.userData.vrmNodeConstraintManager});t.userData.vrm=i}})}};function uR(t){let e=new Set;return t.traverse(n=>{if(!n.isMesh)return;let i=n;e.add(i)}),e}function ox(t,e,n){if(e.size===1){let o=e.values().next().value;if(o.weight===1)return t[o.index]}let i=new Float32Array(t[0].count*3),r=0;if(n)r=1;else for(let o of e)r+=o.weight;for(let o of e){let a=t[o.index],l=o.weight/r;for(let c=0;c<a.count;c++)i[c*3+0]+=a.getX(c)*l,i[c*3+1]+=a.getY(c)*l,i[c*3+2]+=a.getZ(c)*l}return new Ge(i,3)}function hR(t){var e;let n=uR(t.scene),i=new Map,r=(e=t.expressionManager)==null?void 0:e.expressionMap;if(r!=null)for(let[s,o]of Object.entries(r)){let a=new Set;for(let l of o.binds)if(l instanceof ch){if(l.weight!==0)for(let c of l.primitives){let u=i.get(c);u==null&&(u=new Map,i.set(c,u));let h=u.get(s);h==null&&(h=new Set,u.set(s,h)),h.add(l)}a.add(l)}for(let l of a)o.deleteBind(l)}for(let s of n){let o=i.get(s);if(o==null)continue;let a=s.geometry.morphAttributes;s.geometry.morphAttributes={};let l=s.geometry.clone();s.geometry=l;let c=l.morphTargetsRelative,u=a.position!=null,h=a.normal!=null,d={},f={},g=[];if(u||h){u&&(d.position=[]),h&&(d.normal=[]);let _=0;for(let[m,p]of o)u&&(d.position[_]=ox(a.position,p,c)),h&&(d.normal[_]=ox(a.normal,p,c)),r?.[m].addBind(new ch({index:_,weight:1,primitives:[s]})),f[m]=_,g.push(0),_++}l.morphAttributes=d,s.morphTargetDictionary=f,s.morphTargetInfluences=g}}function hh(t,e,n){if(t.getComponent)return t.getComponent(e,n);{let i=t.array[e*t.itemSize+n];return t.normalized&&(i=gt.denormalize(i,t.array)),i}}function Ix(t,e,n,i){t.setComponent?t.setComponent(e,n,i):(t.normalized&&(i=gt.normalize(i,t.array)),t.array[e*t.itemSize+n]=i)}function dR(t){var e;let n=fR(t),i=new Set;for(let h of n)i.has(h.geometry)&&(h.geometry=xR(h.geometry)),i.add(h.geometry);let r=new Map;for(let h of i){let d=h.getAttribute("skinIndex"),f=(e=r.get(d))!=null?e:new Map;r.set(d,f);let g=h.getAttribute("skinWeight"),_=pR(d,g);f.set(g,_)}let s=new Map;for(let h of n){let d=mR(h,r);s.set(h,d)}let o=[];for(let[h,d]of s){let f=!1;for(let g of o)if(gR(d,g.boneInverseMap)){f=!0,g.meshes.add(h);for(let[m,p]of d)g.boneInverseMap.set(m,p);break}f||o.push({boneInverseMap:d,meshes:new Set([h])})}let a=new Map,l=new Zp,c=new Zp,u=new Zp;for(let h of o){let{boneInverseMap:d,meshes:f}=h,g=Array.from(d.keys()),_=Array.from(d.values()),m=new wi(g,_),p=c.getOrCreate(m);for(let E of f){let T=E.geometry.getAttribute("skinIndex"),v=l.getOrCreate(T),C=E.skeleton.bones,A=C.map(S=>u.getOrCreate(S)).join(","),b=`${v};${p};${A}`,P=a.get(b);P==null&&(P=T.clone(),_R(P,C,g),a.set(b,P)),E.geometry.setAttribute("skinIndex",P)}for(let E of f)E.bind(m,new be)}}function fR(t){let e=new Set;return t.traverse(n=>{if(!n.isSkinnedMesh)return;let i=n;e.add(i)}),e}function pR(t,e){let n=new Set;for(let i=0;i<t.count;i++)for(let r=0;r<t.itemSize;r++){let s=hh(t,i,r);hh(e,i,r)!==0&&n.add(s)}return n}function mR(t,e){let n=new Map,i=t.skeleton,r=t.geometry,s=r.getAttribute("skinIndex"),o=r.getAttribute("skinWeight"),a=e.get(s),l=a?.get(o);if(!l)throw new Error("Unreachable. attributeUsedIndexSetMap does not know the skin index attribute or the skin weight attribute.");for(let c of l)n.set(i.bones[c],i.boneInverses[c]);return n}function gR(t,e){for(let[n,i]of t.entries()){let r=e.get(n);if(r!=null&&!vR(i,r))return!1}return!0}function _R(t,e,n){let i=new Map;for(let s of e)i.set(s,i.size);let r=new Map;for(let[s,o]of n.entries()){let a=i.get(o);r.set(a,s)}for(let s=0;s<t.count;s++)for(let o=0;o<t.itemSize;o++){let a=hh(t,s,o),l=r.get(a);Ix(t,s,o,l)}t.needsUpdate=!0}function vR(t,e,n){if(n=n||1e-4,t.elements.length!=e.elements.length)return!1;for(let i=0,r=t.elements.length;i<r;i++)if(Math.abs(t.elements[i]-e.elements[i])>n)return!1;return!0}var Zp=class{constructor(){this._objectIndexMap=new Map,this._index=0}get(t){return this._objectIndexMap.get(t)}getOrCreate(t){let e=this._objectIndexMap.get(t);return e==null&&(e=this._index,this._objectIndexMap.set(t,e),this._index++),e}};function xR(t){var e,n,i,r;let s=new ht;s.name=t.name,s.setIndex(t.index);for(let[o,a]of Object.entries(t.attributes))s.setAttribute(o,a);for(let[o,a]of Object.entries(t.morphAttributes)){let l=o;s.morphAttributes[l]=a.concat()}s.morphTargetsRelative=t.morphTargetsRelative,s.groups=[];for(let o of t.groups)s.addGroup(o.start,o.count,o.materialIndex);return s.boundingSphere=(n=(e=t.boundingSphere)==null?void 0:e.clone())!=null?n:null,s.boundingBox=(r=(i=t.boundingBox)==null?void 0:i.clone())!=null?r:null,s.drawRange.start=t.drawRange.start,s.drawRange.count=t.drawRange.count,s.userData=t.userData,s}function ax(t){if(Object.values(t).forEach(e=>{e?.isTexture&&e.dispose()}),t.isShaderMaterial){let e=t.uniforms;e&&Object.values(e).forEach(n=>{let i=n.value;i?.isTexture&&i.dispose()})}t.dispose()}function yR(t){let e=t.geometry;e&&e.dispose();let n=t.skeleton;n&&n.dispose();let i=t.material;i&&(Array.isArray(i)?i.forEach(r=>ax(r)):i&&ax(i))}function MR(t){t.traverse(yR)}function ER(t,e){var n,i;console.warn("VRMUtils.removeUnnecessaryJoints: removeUnnecessaryJoints is deprecated. Use combineSkeletons instead. combineSkeletons contributes more to the performance improvement. This function will be removed in the next major version.");let r=(n=e?.experimentalSameBoneCounts)!=null?n:!1,s=[];t.traverse(l=>{l.type==="SkinnedMesh"&&s.push(l)});let o=new Map,a=0;for(let l of s){let u=l.geometry.getAttribute("skinIndex");if(o.has(u))continue;let h=new Map,d=new Map;for(let f=0;f<u.count;f++)for(let g=0;g<u.itemSize;g++){let _=hh(u,f,g),m=h.get(_);m==null&&(m=h.size,h.set(_,m),d.set(m,_)),Ix(u,f,g,m)}u.needsUpdate=!0,o.set(u,d),a=Math.max(a,h.size)}for(let l of s){let u=l.geometry.getAttribute("skinIndex"),h=o.get(u),d=[],f=[],g=r?a:h.size;for(let m=0;m<g;m++){let p=(i=h.get(m))!=null?i:0;d.push(l.skeleton.bones[p]),f.push(l.skeleton.boneInverses[p])}let _=new wi(d,f);l.bind(_,new be)}}function SR(t){let e=new Map;t.traverse(n=>{var i,r,s,o;if(!n.isMesh)return;let a=n,l=a.geometry,c=l.index;if(c==null)return;let u=e.get(l);if(u!=null){a.geometry=u;return}let h=Object.values(l.attributes)[0].count,d=new Array(h),f=0,g=c.array;for(let v=0;v<g.length;v++){let C=g[v];d[C]||(d[C]=!0,f++)}if(f===h)return;let _=[],m=[],p=0;for(let v=0;v<d.length;v++)if(d[v]){let C=p++;_[v]=C,m[C]=v}let E=new ht;E.name=l.name,E.morphTargetsRelative=l.morphTargetsRelative,l.groups.forEach(v=>{E.addGroup(v.start,v.count,v.materialIndex)}),E.boundingBox=(r=(i=l.boundingBox)==null?void 0:i.clone())!=null?r:null,E.boundingSphere=(o=(s=l.boundingSphere)==null?void 0:s.clone())!=null?o:null,E.setDrawRange(l.drawRange.start,l.drawRange.count),E.userData=l.userData,e.set(l,E);{let v=c.array,C=new v.constructor(v.length);for(let A=0;A<v.length;A++){let b=v[A],P=_[b];C[A]=P}E.setIndex(new Ge(C,1,!1))}Object.keys(l.attributes).forEach(v=>{let C=l.attributes[v];if(C.isInterleavedBufferAttribute)throw new Error("removeUnnecessaryVertices: InterleavedBufferAttribute is not supported");let A=C.array,{itemSize:b,normalized:P}=C,S=new A.constructor(m.length*b);m.forEach((y,L)=>{for(let F=0;F<b;F++)S[L*b+F]=A[y*b+F]}),E.setAttribute(v,new Ge(S,b,P))});let T=!0;for(let[v,C]of Object.entries(l.morphAttributes)){let A=v;E.morphAttributes[A]=[];for(let b=0;b<C.length;b++){let P=C[b];if(P.isInterleavedBufferAttribute)throw new Error("removeUnnecessaryVertices: InterleavedBufferAttribute is not supported");let S=P.array,{itemSize:y,normalized:L}=P,F=new S.constructor(m.length*y);m.forEach((B,G)=>{for(let $=0;$<y;$++)F[G*y+$]=S[B*y+$]}),T=T&&F.every(B=>B===0),E.morphAttributes[A][b]=new Ge(F,y,L)}}T&&(E.morphAttributes={}),a.geometry=E}),Array.from(e.keys()).forEach(n=>{n.dispose()})}function TR(t){var e;((e=t.meta)==null?void 0:e.metaVersion)==="0"&&(t.scene.rotation.y=Math.PI)}var Zo=class{constructor(){}};Zo.combineMorphs=hR;Zo.combineSkeletons=dR;Zo.deepDispose=MR;Zo.removeUnnecessaryJoints=ER;Zo.removeUnnecessaryVertices=SR;Zo.rotateVRM0=TR;var om=["left","right"],ji=t=>t[0].toUpperCase()+t.slice(1),Ll=["index","middle","ring","little"],am=["Proximal","Intermediate","Distal"],lm=["Metacarpal","Proximal","Distal"],Ht=["hips","spine","chest","neck","head","leftEye","rightEye"];for(let t of om){Ht.push(`${t}Shoulder`,`${t}UpperArm`,`${t}LowerArm`,`${t}Hand`);for(let e of lm)Ht.push(`${t}Thumb${e}`);for(let e of Ll)for(let n of am)Ht.push(`${t}${ji(e)}${n}`);Ht.push(`${t}UpperLeg`,`${t}LowerLeg`,`${t}Foot`,`${t}Toes`)}var Pl={};for(let t of om){Object.assign(Pl,{[`${t}UpperArm`]:`${t}LowerArm`,[`${t}LowerArm`]:`${t}Hand`,[`${t}UpperLeg`]:`${t}LowerLeg`,[`${t}LowerLeg`]:`${t}Foot`,[`${t}Foot`]:`${t}Toes`,[`${t}ThumbMetacarpal`]:`${t}ThumbProximal`,[`${t}ThumbProximal`]:`${t}ThumbDistal`});for(let e of Ll)Pl[`${t}${ji(e)}Proximal`]=`${t}${ji(e)}Intermediate`,Pl[`${t}${ji(e)}Intermediate`]=`${t}${ji(e)}Distal`}var Ko={spine:"hips",chest:"spine",neck:"chest",head:"neck",leftEye:"head",rightEye:"head"};for(let t of om){Object.assign(Ko,{[`${t}Shoulder`]:"chest",[`${t}UpperArm`]:`${t}Shoulder`,[`${t}LowerArm`]:`${t}UpperArm`,[`${t}Hand`]:`${t}LowerArm`,[`${t}UpperLeg`]:"hips",[`${t}LowerLeg`]:`${t}UpperLeg`,[`${t}Foot`]:`${t}LowerLeg`,[`${t}Toes`]:`${t}Foot`,[`${t}ThumbMetacarpal`]:`${t}Hand`,[`${t}ThumbProximal`]:`${t}ThumbMetacarpal`,[`${t}ThumbDistal`]:`${t}ThumbProximal`});for(let e of Ll)Ko[`${t}${ji(e)}Proximal`]=`${t}Hand`,Ko[`${t}${ji(e)}Intermediate`]=`${t}${ji(e)}Proximal`,Ko[`${t}${ji(e)}Distal`]=`${t}${ji(e)}Intermediate`}var $r=["blink","blinkLeft","blinkRight","aa","ih","ou","ee","oh","happy","angry","surprised"],Ul=["face","pose","legs","leftHand","rightHand"],Px=Ht.length*4;var Ii=(t,e=0,n=1)=>t<e?e:t>n?n:t;function Lx(t,e=!0){let n=g=>t[g]||0,i=n(e?"eyeBlinkRight":"eyeBlinkLeft"),r=n(e?"eyeBlinkLeft":"eyeBlinkRight"),s=Ii(Math.min(i,r)),o=(n("mouthStretchLeft")+n("mouthStretchRight"))/2,a=(n("mouthSmileLeft")+n("mouthSmileRight"))/2,l=Ii(n("jawOpen")*1.4-n("mouthClose")*.6-n("mouthFunnel")*.5-n("mouthPucker")*.5),c=Ii(n("mouthFunnel")*1.3*(.4+n("jawOpen"))),u=Ii(n("mouthPucker")*1.4),h=Ii(o*1.6+a*.4)*(1-l*.5),d=Ii(o*.7+n("jawOpen")*.25)*(1-l)*(1-c),f=l+c+u+h+d;return f>1&&(l/=f,c/=f,u/=f,h/=f,d/=f),{blink:s,blinkLeft:Ii(i-s),blinkRight:Ii(r-s),aa:l,ih:d,ou:u,ee:h,oh:c,happy:Ii(a*1.3),angry:Ii((n("browDownLeft")+n("browDownRight"))/2*1.5),surprised:Ii(n("browInnerUp")*1.3)}}function Ux(t,e=!0){let n=r=>t[r]||0,i=r=>{let s=r==="left"===e?"Right":"Left",o=n(`eyeLookOut${s}`),a=n(`eyeLookIn${s}`),l=n(`eyeLookUp${s}`),c=n(`eyeLookDown${s}`),u=r==="left"?1:-1;return[(c-l)*.35,u*(o-a)*.5]};return{left:i("left"),right:i("right")}}var bR=t=>t[0].toUpperCase()+t.slice(1),cm=(t,e,n)=>new w(t,e,n),Jo=()=>new he,Nl=.5,wR=.2,AR={shoulder:[11,12],elbow:[13,14],wrist:[15,16],hip:[23,24],knee:[25,26],ankle:[27,28],heel:[29,30],toe:[31,32]},Nx={index:5,middle:9,ring:13,little:17},dh={eyeSubjectLeft:263,eyeSubjectRight:33,forehead:10,chin:152};function Dx(t){let e={};for(let[i,r]of Object.entries(Pl)){let s=t(r);s&&s.lengthSq()>1e-12&&(e[i]=s.clone().normalize())}for(let i of Ht)!e[i]&&/Distal$/.test(i)&&(e[i]=e[Ko[i]]?.clone()??cm(1,0,0));let n={};for(let i of["left","right"]){let r=t(`${i}MiddleProximal`),s=t(`${i}IndexProximal`),o=t(`${i}LittleProximal`);r&&s&&o&&(n[i]={axis:r.clone().normalize(),side:s.clone().sub(o).normalize()})}return{dir:e,frames:n}}function um(t,e){let n=t.clone().normalize(),i=e.clone().addScaledVector(n,-e.dot(n));if(i.lengthSq()<1e-10)return null;i.normalize();let r=new w().crossVectors(n,i);return new be().makeBasis(n,i,r)}function fh(t,e){let n=um(t,e);return n?new he().setFromRotationMatrix(n):null}var Qo=(t,e)=>new he().setFromUnitVectors(t,e.clone().normalize()),ea=(t,e)=>t.clone().invert().multiply(e),ph=class{constructor(e,{mirror:n=!0,upperBody:i=!1}={}){this.rest=e,this.mirror=n,this.upperBody=i}conv(e){return cm(this.mirror?-e.x:e.x,-e.y,-e.z)}solve({pose:e=null,hands:n={},face:i=null}={}){let r={};for(let d of Ht)r[d]=Jo();this.solved=new Set;let s=d=>{let f=n[this.mirror?d==="left"?"right":"left":d];return!!(f&&f.length>=21)},o={face:!1,pose:!1,legs:!1,leftHand:!1,rightHand:!1},a={};a.hips=Jo();let l=d=>d==="left"==!this.mirror?0:1,c=(d,f)=>e.world[AR[d][l(f)]],u=(d,f)=>c(d,f).visibility??1;if(e&&e.world&&e.world.length>=33){let d=this.conv(c("hip","left")),f=this.conv(c("hip","right")),g=this.conv(c("shoulder","left")),_=this.conv(c("shoulder","right")),m=[c("hip","left"),c("hip","right"),c("shoulder","left"),c("shoulder","right")].every(E=>(E.visibility??1)>=Nl),p=[c("shoulder","left"),c("shoulder","right")].every(E=>(E.visibility??1)>=Nl);if(m&&!this.upperBody){let E=d.clone().add(f).multiplyScalar(.5),v=g.clone().add(_).multiplyScalar(.5).clone().sub(E),C=fh(d.clone().sub(f),v),A=fh(g.clone().sub(_),v);if(C&&A){o.pose=!0,this.put(r,"hips",C);let b=C.clone().slerp(A,.45);this.put(r,"spine",ea(C,b)),this.put(r,"chest",ea(b,A)),a.hips=C,a.spine=b,a.chest=A,a.neck=A,a.head=A;for(let P of["left","right"])this.arm(P,c,u,r,a,A,s(P));this.legs(c,u,r,a,C,o)}}else if(p){let E=fh(g.clone().sub(_),cm(0,1,0));if(E){o.pose=!0;let T=Jo().slerp(E,.45);this.put(r,"spine",T),this.put(r,"chest",ea(T,E)),a.hips=Jo(),a.spine=T,a.chest=E,a.neck=E,a.head=E;for(let v of["left","right"])this.arm(v,c,u,r,a,E,s(v))}}}this.handsAndFingers(n,e&&o.pose,r,a,o);let h={quats:r,expr:{},live:o,root:null,solved:this.solved};return i&&this.faceSolve(i,r,a,o,h),e&&o.pose&&(h.root=this.rootFrom(e)),h}arm(e,n,i,r,s,o,a=!1){let l=this.conv(n("shoulder",e)),c=this.conv(n("elbow",e)),u=this.conv(n("wrist",e)),h=this.rest.dir;if(i("elbow",e)<Nl||i("shoulder",e)<Nl)return;let d=o.clone(),f=c.clone().sub(l).applyQuaternion(o.clone().invert());this.put(r,`${e}UpperArm`,Qo(h[`${e}UpperArm`],f));let g=d.clone().multiply(r[`${e}UpperArm`]);if(s[`${e}UpperArm`]=g,i("wrist",e)<(a?wR:Nl))return;let _=u.clone().sub(c).applyQuaternion(g.clone().invert());this.put(r,`${e}LowerArm`,Qo(h[`${e}LowerArm`],_)),s[`${e}LowerArm`]=g.clone().multiply(r[`${e}LowerArm`]),s[`${e}Hand`]=s[`${e}LowerArm`]}legs(e,n,i,r,s,o){let a=this.rest.dir,l=c=>["hip","knee","ankle"].every(u=>n(u,c)>=.6);for(let c of["left","right"]){if(!l(c))continue;o.legs=!0;let u=this.conv(e("hip",c)),h=this.conv(e("knee",c)),d=this.conv(e("ankle",c)),f=this.conv(e("toe",c)),g=h.clone().sub(u).applyQuaternion(s.clone().invert());this.put(i,`${c}UpperLeg`,Qo(a[`${c}UpperLeg`],g));let _=s.clone().multiply(i[`${c}UpperLeg`]),m=d.clone().sub(h).applyQuaternion(_.clone().invert());this.put(i,`${c}LowerLeg`,Qo(a[`${c}LowerLeg`],m));let p=_.clone().multiply(i[`${c}LowerLeg`]);if(n("toe",c)>=.5&&a[`${c}Foot`]){let E=f.clone().sub(d).applyQuaternion(p.clone().invert());this.put(i,`${c}Foot`,Qo(a[`${c}Foot`],E))}}}handsAndFingers(e,n,i,r,s){for(let o of["left","right"]){let a=e[this.mirror?o==="left"?"right":"left":o],l=r[`${o}LowerArm`];if(!a||a.length<21||!l||!n)continue;let c=a.map(g=>this.conv(g)),u=this.rest.frames[o],h=l;if(u){let g=c[9].clone().sub(c[0]),_=c[5].clone().sub(c[17]),m=um(g,this.mirror?_.clone().negate():_),p=um(u.axis,u.side);m&&p&&(h=new he().setFromRotationMatrix(m.clone().multiply(p.clone().transpose())))}this.put(i,`${o}Hand`,ea(l,h)),r[`${o}Hand`]=h,s[`${o}Hand`]=!0;let d=(g,_,m,p)=>{let E=this.rest.dir[g];if(!E)return p;let T=c[m].clone().sub(c[_]).applyQuaternion(p.clone().invert());return this.put(i,g,Qo(E,T)),p.clone().multiply(i[g])},f=h;lm.forEach((g,_)=>{f=d(`${o}Thumb${g}`,1+_,2+_,f)});for(let g of Ll)f=h,am.forEach((_,m)=>{f=d(`${o}${bR(g)}${_}`,Nx[g]+m,Nx[g]+m+1,f)})}}faceSolve({landmarks:e,blend:n,aspect:i=4/3},r,s,o,a){if(n){a.expr=Lx(n,this.mirror);let p=Ux(n,this.mirror);r.leftEye.setFromEuler({x:p.left[0],y:p.left[1],z:0,order:"XYZ",isEuler:!0}),r.rightEye.setFromEuler({x:p.right[0],y:p.right[1],z:0,order:"XYZ",isEuler:!0}),this.solved.add("leftEye"),this.solved.add("rightEye")}if(!e||e.length<400)return;let l=p=>this.conv({x:e[p].x*i,y:e[p].y,z:e[p].z*i}),c=l(dh.eyeSubjectLeft),u=l(dh.eyeSubjectRight),h=this.mirror?u:c,d=this.mirror?c:u,f=fh(h.clone().sub(d),l(dh.forehead).sub(l(dh.chin)));if(!f)return;o.face=!0;let g=s.chest||Jo(),_=ea(g,f);this.put(r,"neck",Jo().slerp(_,.4));let m=g.clone().multiply(r.neck);this.put(r,"head",ea(m,f))}put(e,n,i){e[n].copy(i),this.solved.add(n)}rootFrom(e){return null}};var js=typeof self<"u"?self:{};function Xs(){throw Error("Invalid UTF8")}function Ox(t,e){return e=String.fromCharCode.apply(null,e),t==null?e:t+e}var mh,hm,RR=typeof TextDecoder<"u",CR,IR=typeof TextEncoder<"u";function $y(t){if(IR)t=(CR||=new TextEncoder).encode(t);else{let n=0,i=new Uint8Array(3*t.length);for(let r=0;r<t.length;r++){var e=t.charCodeAt(r);if(e<128)i[n++]=e;else{if(e<2048)i[n++]=e>>6|192;else{if(e>=55296&&e<=57343){if(e<=56319&&r<t.length){let s=t.charCodeAt(++r);if(s>=56320&&s<=57343){e=1024*(e-55296)+s-56320+65536,i[n++]=e>>18|240,i[n++]=e>>12&63|128,i[n++]=e>>6&63|128,i[n++]=63&e|128;continue}r--}e=65533}i[n++]=e>>12|224,i[n++]=e>>6&63|128}i[n++]=63&e|128}}t=n===i.length?i:i.subarray(0,n)}return t}var Wm,Rh;e:{for(dm=["CLOSURE_FLAGS"],gh=js,_h=0;_h<dm.length;_h++)if((gh=gh[dm[_h]])==null){Rh=null;break e}Rh=gh}var dm,gh,_h,Wl,Fx=Rh&&Rh[610401301];Wm=Fx!=null&&Fx;var Bx=js.navigator;function Tm(t){return!!Wm&&!!Wl&&Wl.brands.some(({brand:e})=>e&&e.indexOf(t)!=-1)}function di(t){var e;return(e=js.navigator)&&(e=e.userAgent)||(e=""),e.indexOf(t)!=-1}function Kr(){return!!Wm&&!!Wl&&Wl.brands.length>0}function fm(){return Kr()?Tm("Chromium"):(di("Chrome")||di("CriOS"))&&!(!Kr()&&di("Edge"))||di("Silk")}function Xm(t){return Xm[" "](t),t}Wl=Bx&&Bx.userAgentData||null,Xm[" "]=function(){};var PR=!Kr()&&(di("Trident")||di("MSIE"));!di("Android")||fm(),fm(),di("Safari")&&(fm()||!Kr()&&di("Coast")||!Kr()&&di("Opera")||!Kr()&&di("Edge")||(Kr()?Tm("Microsoft Edge"):di("Edg/"))||Kr()&&Tm("Opera"));var jy={},Bl=null;function LR(t){let e=t.length,n=3*e/4;n%3?n=Math.floor(n):"=.".indexOf(t[e-1])!=-1&&(n="=.".indexOf(t[e-2])!=-1?n-2:n-1);let i=new Uint8Array(n),r=0;return function(s,o){function a(c){for(;l<s.length;){let u=s.charAt(l++),h=Bl[u];if(h!=null)return h;if(!/^[\s\xa0]*$/.test(u))throw Error("Unknown base64 encoding at char: "+u)}return c}Zy();let l=0;for(;;){let c=a(-1),u=a(0),h=a(64),d=a(64);if(d===64&&c===-1)break;o(c<<2|u>>4),h!=64&&(o(u<<4&240|h>>2),d!=64&&o(h<<6&192|d))}}(t,function(s){i[r++]=s}),r!==n?i.subarray(0,r):i}function Zy(){if(!Bl){Bl={};var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),e=["+/=","+/","-_=","-_.","-_"];for(let n=0;n<5;n++){let i=t.concat(e[n].split(""));jy[n]=i;for(let r=0;r<i.length;r++){let s=i[r];Bl[s]===void 0&&(Bl[s]=r)}}}}var Ky=typeof Uint8Array<"u",Jy=!PR&&typeof btoa=="function";function kx(t){if(!Jy){var e;e===void 0&&(e=0),Zy(),e=jy[e];var n=Array(Math.floor(t.length/3)),i=e[64]||"";let l=0,c=0;for(;l<t.length-2;l+=3){var r=t[l],s=t[l+1],o=t[l+2],a=e[r>>2];r=e[(3&r)<<4|s>>4],s=e[(15&s)<<2|o>>6],o=e[63&o],n[c++]=a+r+s+o}switch(a=0,o=i,t.length-l){case 2:o=e[(15&(a=t[l+1]))<<2]||i;case 1:t=t[l],n[c]=e[t>>2]+e[(3&t)<<4|a>>4]+o+i}return n.join("")}for(e="",n=0,i=t.length-10240;n<i;)e+=String.fromCharCode.apply(null,t.subarray(n,n+=10240));return e+=String.fromCharCode.apply(null,n?t.subarray(n):t),btoa(e)}var Hx=/[-_.]/g,UR={"-":"+",_:"/",".":"="};function NR(t){return UR[t]||""}function Qy(t){if(!Jy)return LR(t);Hx.test(t)&&(t=t.replace(Hx,NR)),t=atob(t);let e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}function jl(t){return Ky&&t!=null&&t instanceof Uint8Array}var ca={};function Zs(){return DR||=new wr(null,ca)}function qm(t){e1(ca);var e=t.g;return(e=e==null||jl(e)?e:typeof e=="string"?Qy(e):null)==null?e:t.g=e}var wr=class{h(){return new Uint8Array(qm(this)||0)}constructor(t,e){if(e1(e),this.g=t,t!=null&&t.length===0)throw Error("ByteString should be constructed with non-empty values")}},DR,OR;function e1(t){if(t!==ca)throw Error("illegal external caller")}function t1(t,e){t.__closure__error__context__984382||(t.__closure__error__context__984382={}),t.__closure__error__context__984382.severity=e}function bm(t){return t1(t=Error(t),"warning"),t}var Bh=typeof Symbol=="function"&&typeof Symbol()=="symbol",FR=new Set;function Zl(t,e,n=!1,i=!1){return t=typeof Symbol=="function"&&typeof Symbol()=="symbol"?i&&Symbol.for&&t?Symbol.for(t):t!=null?Symbol(t):Symbol():e,n&&FR.add(t),t}var BR=Zl("jas",void 0,!0,!0),Vx=Zl(void 0,"0di"),pm=Zl(void 0,"2ex"),Dl=Zl(void 0,"1oa",!0),ua=Zl(void 0,Symbol(),!0),Le=Bh?BR:"Ga",n1={Ga:{value:0,configurable:!0,writable:!0,enumerable:!1}},i1=Object.defineProperties;function kh(t,e){Bh||Le in t||i1(t,n1),t[Le]|=e}function Zt(t,e){Bh||Le in t||i1(t,n1),t[Le]=e}function xa(t){return kh(t,34),t}function kR(t,e){Zt(e,-30975&(0|t))}function wm(t,e){Zt(e,-30941&(34|t))}function Ym(){return typeof BigInt=="function"}function Fn(t){return Array.prototype.slice.call(t)}var $m,Kl={},r1={};function zx(t){return!(!t||typeof t!="object"||t.Ia!==r1)}function jm(t){return t!==null&&typeof t=="object"&&!Array.isArray(t)&&t.constructor===Object}function Zm(t,e){if(t!=null){if(typeof t=="string")t=t?new wr(t,ca):Zs();else if(t.constructor!==wr)if(jl(t))t=t.length?new wr(new Uint8Array(t),ca):Zs();else{if(!e)throw Error();t=void 0}}return t}function Ch(t){return!(!Array.isArray(t)||t.length)&&!!(1&(0|t[Le]))}var Gx=[];function rs(t){if(2&t)throw Error()}Zt(Gx,55),$m=Object.freeze(Gx);var Ih=class t{constructor(e,n,i){this.l=0,this.g=e,this.h=n,this.m=i}next(){if(this.l<this.g.length){let e=this.g[this.l++];return{done:!1,value:this.h?this.h.call(this.m,e):e}}return{done:!0,value:void 0}}[Symbol.iterator](){return new t(this.g,this.h,this.m)}};function Km(t){return ua?t[ua]:void 0}var HR=Object.freeze({});function Hh(t){return t.Qa=!0,t}var VR=Hh(t=>typeof t=="number"),Wx=Hh(t=>typeof t=="string"),zR=Hh(t=>typeof t=="boolean"),Vh=typeof js.BigInt=="function"&&typeof js.BigInt(0)=="bigint",Am=Hh(t=>Vh?t>=WR&&t<=qR:t[0]==="-"?Xx(t,GR):Xx(t,XR)),GR=Number.MIN_SAFE_INTEGER.toString(),WR=Vh?BigInt(Number.MIN_SAFE_INTEGER):void 0,XR=Number.MAX_SAFE_INTEGER.toString(),qR=Vh?BigInt(Number.MAX_SAFE_INTEGER):void 0;function Xx(t,e){if(t.length>e.length)return!1;if(t.length<e.length||t===e)return!0;for(let n=0;n<t.length;n++){let i=t[n],r=e[n];if(i>r)return!1;if(i<r)return!0}}var YR=typeof Uint8Array.prototype.slice=="function",s1,wt=0,Gt=0;function qx(t){let e=t>>>0;wt=e,Gt=(t-e)/4294967296>>>0}function ha(t){if(t<0){qx(-t);let[e,n]=tg(wt,Gt);wt=e>>>0,Gt=n>>>0}else qx(t)}function Jm(t){let e=s1||=new DataView(new ArrayBuffer(8));e.setFloat32(0,+t,!0),Gt=0,wt=e.getUint32(0,!0)}function Qm(t,e){let n=4294967296*e+(t>>>0);return Number.isSafeInteger(n)?n:Xl(t,e)}function eg(t,e){let n=2147483648&e;return n&&(e=~e>>>0,(t=1+~t>>>0)==0&&(e=e+1>>>0)),typeof(t=Qm(t,e))=="number"?n?-t:t:n?"-"+t:t}function Xl(t,e){if(t>>>=0,(e>>>=0)<=2097151)var n=""+(4294967296*e+t);else Ym()?n=""+(BigInt(e)<<BigInt(32)|BigInt(t)):(t=(16777215&t)+6777216*(n=16777215&(t>>>24|e<<8))+6710656*(e=e>>16&65535),n+=8147497*e,e*=2,t>=1e7&&(n+=t/1e7>>>0,t%=1e7),n>=1e7&&(e+=n/1e7>>>0,n%=1e7),n=e+Yx(n)+Yx(t));return n}function Yx(t){return t=String(t),"0000000".slice(t.length)+t}function zh(t){if(t.length<16)ha(Number(t));else if(Ym())t=BigInt(t),wt=Number(t&BigInt(4294967295))>>>0,Gt=Number(t>>BigInt(32)&BigInt(4294967295));else{let e=+(t[0]==="-");Gt=wt=0;let n=t.length;for(let i=e,r=(n-e)%6+e;r<=n;i=r,r+=6){let s=Number(t.slice(i,r));Gt*=1e6,wt=1e6*wt+s,wt>=4294967296&&(Gt+=Math.trunc(wt/4294967296),Gt>>>=0,wt>>>=0)}if(e){let[i,r]=tg(wt,Gt);wt=i,Gt=r}}}function tg(t,e){return e=~e,t?t=1+~t:e+=1,[t,e]}var ng=typeof BigInt=="function"?BigInt.asIntN:void 0,$R=typeof BigInt=="function"?BigInt.asUintN:void 0,ra=Number.isSafeInteger,Gh=Number.isFinite,Ph=Math.trunc;function ss(t){return t==null||typeof t=="number"?t:t==="NaN"||t==="Infinity"||t==="-Infinity"?Number(t):void 0}function o1(t){return t==null||typeof t=="boolean"?t:typeof t=="number"?!!t:void 0}var jR=/^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;function Wh(t){switch(typeof t){case"bigint":return!0;case"number":return Gh(t);case"string":return jR.test(t);default:return!1}}function ya(t){if(t==null)return t;if(typeof t=="string"&&t)t=+t;else if(typeof t!="number")return;return Gh(t)?0|t:void 0}function a1(t){if(t==null)return t;if(typeof t=="string"&&t)t=+t;else if(typeof t!="number")return;return Gh(t)?t>>>0:void 0}function $x(t){if(t[0]==="-")return!1;let e=t.length;return e<20||e===20&&Number(t.substring(0,6))<184467}function ig(t){return t=Ph(t),ra(t)||(ha(t),t=eg(wt,Gt)),t}function rg(t){var e=Ph(Number(t));if(ra(e))return String(e);if((e=t.indexOf("."))!==-1&&(t=t.substring(0,e)),e=t.length,!(t[0]==="-"?e<20||e===20&&Number(t.substring(0,7))>-922337:e<19||e===19&&Number(t.substring(0,6))<922337))if(zh(t),t=wt,2147483648&(e=Gt))if(Ym())t=""+(BigInt(0|e)<<BigInt(32)|BigInt(t>>>0));else{let[n,i]=tg(t,e);t="-"+Xl(n,i)}else t=Xl(t,e);return t}function Lh(t){return t==null?t:typeof t=="bigint"?(Am(t)?t=Number(t):(t=ng(64,t),t=Am(t)?Number(t):String(t)),t):Wh(t)?typeof t=="number"?ig(t):rg(t):void 0}function ZR(t){if(t==null)return t;var e=typeof t;if(e==="bigint")return String($R(64,t));if(Wh(t)){if(e==="string")return e=Ph(Number(t)),ra(e)&&e>=0?t=String(e):((e=t.indexOf("."))!==-1&&(t=t.substring(0,e)),$x(t)||(zh(t),t=Xl(wt,Gt))),t;if(e==="number")return(t=Ph(t))>=0&&ra(t)?t:function(n){if(n<0){ha(n);var i=Xl(wt,Gt);return n=Number(i),ra(n)?n:i}return $x(i=String(n))?i:(ha(n),Qm(wt,Gt))}(t)}}function l1(t){if(typeof t!="string")throw Error();return t}function Ma(t){if(t!=null&&typeof t!="string")throw Error();return t}function da(t){return t==null||typeof t=="string"?t:void 0}function sg(t,e,n,i){if(t!=null&&typeof t=="object"&&t.W===Kl)return t;if(!Array.isArray(t))return n?2&i?((t=e[Vx])||(xa((t=new e).u),t=e[Vx]=t),e=t):e=new e:e=void 0,e;let r=n=0|t[Le];return r===0&&(r|=32&i),r|=2&i,r!==n&&Zt(t,r),new e(t)}function KR(t,e,n){if(e)e:{if(!Wh(e=t))throw bm("int64");switch(typeof e){case"string":e=rg(e);break e;case"bigint":if(t=e=ng(64,e),Wx(t)){if(!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(t))throw Error(String(t))}else if(VR(t)&&!Number.isSafeInteger(t))throw Error(String(t));e=Vh?BigInt(e):zR(e)?e?"1":"0":Wx(e)?e.trim()||"0":String(e);break e;default:e=ig(e)}}else e=Lh(t);return typeof(n=(t=e)==null?n?0:void 0:t)=="string"&&ra(e=+n)?e:n}var JR={},QR=function(){try{return Xm(new class extends Map{constructor(){super()}}),!1}catch{return!0}}(),Hl=class{constructor(){this.g=new Map}get(e){return this.g.get(e)}set(e,n){return this.g.set(e,n),this.size=this.g.size,this}delete(e){return e=this.g.delete(e),this.size=this.g.size,e}clear(){this.g.clear(),this.size=this.g.size}has(e){return this.g.has(e)}entries(){return this.g.entries()}keys(){return this.g.keys()}values(){return this.g.values()}forEach(e,n){return this.g.forEach(e,n)}[Symbol.iterator](){return this.entries()}},eC=QR?(Object.setPrototypeOf(Hl.prototype,Map.prototype),Object.defineProperties(Hl.prototype,{size:{value:0,configurable:!0,enumerable:!0,writable:!0}}),Hl):class extends Map{constructor(){super()}};function jx(t){return t}function mm(t){if(2&t.L)throw Error("Cannot mutate an immutable Map")}var pi=class extends eC{constructor(t,e,n=jx,i=jx){super();let r=0|t[Le];r|=64,Zt(t,r),this.L=r,this.S=e,this.R=n,this.Y=this.S?tC:i;for(let s=0;s<t.length;s++){let o=t[s],a=n(o[0],!1,!0),l=o[1];e?l===void 0&&(l=null):l=i(o[1],!1,!0,void 0,void 0,r),super.set(a,l)}}na(t=Zx){if(this.size!==0)return this.X(t)}X(t=Zx){let e=[],n=super.entries();for(var i;!(i=n.next()).done;)(i=i.value)[0]=t(i[0]),i[1]=t(i[1]),e.push(i);return e}clear(){mm(this),super.clear()}delete(t){return mm(this),super.delete(this.R(t,!0,!1))}entries(){var t=this.ma();return new Ih(t,nC,this)}keys(){return this.Ha()}values(){var t=this.ma();return new Ih(t,pi.prototype.get,this)}forEach(t,e){super.forEach((n,i)=>{t.call(e,this.get(i),i,this)})}set(t,e){return mm(this),(t=this.R(t,!0,!1))==null?this:e==null?(super.delete(t),this):super.set(t,this.Y(e,!0,!0,this.S,!1,this.L))}Na(t){let e=this.R(t[0],!1,!0);t=t[1],t=this.S?t===void 0?null:t:this.Y(t,!1,!0,void 0,!1,this.L),super.set(e,t)}has(t){return super.has(this.R(t,!1,!1))}get(t){t=this.R(t,!1,!1);let e=super.get(t);if(e!==void 0){var n=this.S;return n?((n=this.Y(e,!1,!0,n,this.ra,this.L))!==e&&super.set(t,n),n):e}}ma(){return Array.from(super.keys())}Ha(){return super.keys()}[Symbol.iterator](){return this.entries()}};function tC(t,e,n,i,r,s){return t=sg(t,i,n,s),r&&(t=qh(t)),t}function Zx(t){return t}function nC(t){return[t,this.get(t)]}var iC,c1,rC;function Kx(){return iC||=new pi(xa([]),void 0,void 0,void 0,JR)}function og(t,e,n,i,r){if(t!=null){if(Array.isArray(t))t=Ch(t)?void 0:r&&2&(0|t[Le])?t:ag(t,e,n,i!==void 0,r);else if(jm(t)){let s={};for(let o in t)s[o]=og(t[o],e,n,i,r);t=s}else t=e(t,i);return t}}function ag(t,e,n,i,r){let s=i||n?0|t[Le]:0,o=i?!!(32&s):void 0;i=Fn(t);for(let a=0;a<i.length;a++)i[a]=og(i[a],e,n,o,r);return n&&((t=Km(t))&&(i[ua]=Fn(t)),n(s,i)),i}function sC(t){return og(t,u1,void 0,void 0,!1)}function u1(t){return t.W===Kl?t.toJSON():t instanceof pi?t.na(sC):function(e){switch(typeof e){case"number":return isFinite(e)?e:String(e);case"bigint":return Am(e)?Number(e):String(e);case"boolean":return e?1:0;case"object":if(e)if(Array.isArray(e)){if(Ch(e))return}else{if(jl(e))return kx(e);if(e instanceof wr){let n=e.g;return n==null?"":typeof n=="string"?n:e.g=kx(n)}if(e instanceof pi)return e.na()}}return e}(t)}function h1(t){return ag(t,u1,void 0,void 0,!1)}function Qr(t,e,n){return t=d1(t,e[0],e[1],n?1:2),e!==c1&&n&&kh(t,16384),t}function d1(t,e,n,i){if(t==null){var r=96;n?(t=[n],r|=512):t=[],e&&(r=-33521665&r|(1023&e)<<15)}else{if(!Array.isArray(t))throw Error("narr");if(2048&(r=0|t[Le]))throw Error("farr");if(64&r)return t;if(i===1||i===2||(r|=64),n&&(r|=512,n!==t[0]))throw Error("mid");e:{if(i=(n=t).length){let s=i-1;if(jm(n[s])){if((e=s-(512&(r|=256)?0:-1))>=1024)throw Error("pvtlmt");r=-33521665&r|(1023&e)<<15;break e}}if(e){if((e=Math.max(e,i-(512&r?0:-1)))>1024)throw Error("spvt");r=-33521665&r|(1023&e)<<15}}}return Zt(t,r),t}function Rm(t,e,n=wm){if(t!=null){if(Ky&&t instanceof Uint8Array)return e?t:new Uint8Array(t);if(Array.isArray(t)){var i=0|t[Le];return 2&i?t:(e&&=i===0||!!(32&i)&&!(64&i||!(16&i)),e?(Zt(t,-12293&(34|i)),t):ag(t,Rm,4&i?wm:n,!0,!0))}return t.W===Kl?t=2&(i=0|(n=t.u)[Le])?t:new t.constructor(Xh(n,i,!0)):t instanceof pi&&!(2&t.L)&&(n=xa(t.X(Rm)),t=new pi(n,t.S,t.R,t.Y)),t}}function Xh(t,e,n){let i=n||2&e?wm:kR,r=!!(32&e);return t=function(s,o,a){let l=Fn(s);var c=l.length;let u=256&o?l[c-1]:void 0;for(c+=u?-1:0,o=512&o?1:0;o<c;o++)l[o]=a(l[o]);if(u){o=l[o]={};for(let h in u)o[h]=a(u[h])}return(s=Km(s))&&(l[ua]=Fn(s)),l}(t,e,s=>Rm(s,r,i)),kh(t,32|(n?2:0)),t}function qh(t){let e=t.u,n=0|e[Le];return 2&n?new t.constructor(Xh(e,n,!1)):t}function fa(t,e){return Ir(t=t.u,0|t[Le],e)}function Ir(t,e,n,i){if(n===-1)return null;var r=n+(512&e?0:-1);let s=t.length-1;return r>=s&&256&e?t[s][n]:i&&256&e&&(e=t[s][n])!=null?(t[r]!=null&&pm!=null&&((r=(t=OR??={})[pm]||0)>=4||(t[pm]=r+1,t1(t=Error(),"incident"),function(o){js.setTimeout(()=>{throw o},0)}(t))),e):r<=s?t[r]:void 0}function Rt(t,e,n){let i=t.u,r=0|i[Le];return rs(r),Vt(i,r,e,n),t}function Vt(t,e,n,i){let r=512&e?0:-1,s=n+r;var o=t.length-1;return s>=o&&256&e?(t[o][n]=i,e):s<=o?(t[s]=i,256&e&&n in(t=t[o])&&delete t[n],e):(i!==void 0&&(n>=(o=e>>15&1023||536870912)?i!=null&&(t[o+r]={[n]:i},Zt(t,e|=256)):t[s]=i),e)}function Eh(t,e){let n=0|(t=t.u)[Le],i=Ir(t,n,e),r=ss(i);return r!=null&&r!==i&&Vt(t,n,e,r),r}function f1(t){let e=0|(t=t.u)[Le],n=Ir(t,e,1),i=Zm(n,!0);return i!=null&&i!==n&&Vt(t,e,1,i),i}function qs(){return HR===void 0?2:4}function Ys(t,e,n,i,r){let s=t.u,o=2&(t=0|s[Le])?1:i;r=!!r;let a=0|(i=lg(s,t,e))[Le];if(!(4&a)){4&a&&(i=Fn(i),a=Ar(a,t),t=Vt(s,t,e,i));let l=0,c=0;for(;l<i.length;l++){let u=n(i[l]);u!=null&&(i[c++]=u)}c<l&&(i.length=c),a=cg(a,t),n=-4097&(20|a),a=n&=-8193,Zt(i,a),2&a&&Object.freeze(i)}return o===1||o===4&&32&a?br(a)||(r=a,a|=2,a!==r&&Zt(i,a),Object.freeze(i)):(o===2&&br(a)&&(i=Fn(i),a=Ar(a,t),a=es(a,t,r),Zt(i,a),t=Vt(s,t,e,i)),br(a)||(e=a,a=es(a,t,r),a!==e&&Zt(i,a))),i}function lg(t,e,n,i){return t=Ir(t,e,n,i),Array.isArray(t)?t:$m}function cg(t,e){return t===0&&(t=Ar(t,e)),1|t}function br(t){return!!(2&t)&&!!(4&t)||!!(2048&t)}function p1(t){t=Fn(t);for(let e=0;e<t.length;e++){let n=t[e]=Fn(t[e]);Array.isArray(n[1])&&(n[1]=xa(n[1]))}return t}function Cm(t,e,n,i){let r=0|(t=t.u)[Le];rs(r),Vt(t,r,e,(i==="0"?Number(n)===0:n===i)?void 0:n)}function Ea(t,e,n,i,r){rs(e);var s=!(!(64&e)&&16384&e);let o=(r=lg(t,e,n,r))!==$m;if(s||!o){let a=s=o?0|r[Le]:0;(!o||2&a||br(a)||4&a&&!(32&a))&&(r=Fn(r),a=Ar(a,e),e=Vt(t,e,n,r)),a=-13&cg(a,e),a=es(i?-17&a:16|a,e,!0),a!==s&&Zt(r,a)}return r}function gm(t,e){var n=iM;return hg(ug(t=t.u),t,0|t[Le],n)===e?e:-1}function ug(t){if(Bh)return t[Dl]??(t[Dl]=new Map);if(Dl in t)return t[Dl];let e=new Map;return Object.defineProperty(t,Dl,{value:e}),e}function m1(t,e,n,i){let r=ug(t),s=hg(r,t,e,n);return s!==i&&(s&&(e=Vt(t,e,s)),r.set(n,i)),e}function hg(t,e,n,i){let r=t.get(i);if(r!=null)return r;r=0;for(let s=0;s<i.length;s++){let o=i[s];Ir(e,n,o)!=null&&(r!==0&&(n=Vt(e,n,r)),r=o)}return t.set(i,r),r}function dg(t,e,n,i){let r,s=0|t[Le];if((i=Ir(t,s,n,i))!=null&&i.W===Kl)return(e=qh(i))!==i&&Vt(t,s,n,e),e.u;if(Array.isArray(i)){let o=0|i[Le];r=2&o?Qr(Xh(i,o,!1),e,!0):64&o?i:Qr(r,e,!0)}else r=Qr(void 0,e,!0);return r!==i&&Vt(t,s,n,r),r}function g1(t,e,n,i){let r=0|(t=t.u)[Le];return(e=sg(i=Ir(t,r,n,i),e,!1,r))!==i&&e!=null&&Vt(t,r,n,e),e}function lt(t,e,n,i=!1){if((e=g1(t,e,n,i))==null)return e;if(!(2&(i=0|(t=t.u)[Le]))){let r=qh(e);r!==e&&Vt(t,i,n,e=r)}return e}function _1(t,e,n,i,r,s,o){t=t.u;var a=!!(2&e);let l=a?1:r;s=!!s,o&&=!a;var c=0|(r=lg(t,e,i))[Le];if(!(a=!!(4&c))){var u=r,h=e;let d=!!(2&(c=cg(c,e)));d&&(h|=2);let f=!d,g=!0,_=0,m=0;for(;_<u.length;_++){let p=sg(u[_],n,!1,h);if(p instanceof n){if(!d){let E=!!(2&(0|p.u[Le]));f&&=!E,g&&=E}u[m++]=p}}m<_&&(u.length=m),c|=4,c=g?16|c:-17&c,Zt(u,c=f?8|c:-9&c),d&&Object.freeze(u)}if(o&&!(8&c||!r.length&&(l===1||l===4&&32&c))){for(br(c)&&(r=Fn(r),c=Ar(c,e),e=Vt(t,e,i,r)),n=r,o=c,u=0;u<n.length;u++)(c=n[u])!==(h=qh(c))&&(n[u]=h);o|=8,Zt(n,o=n.length?-17&o:16|o),c=o}return l===1||l===4&&32&c?br(c)||(e=c,(c|=!r.length||16&c&&(!a||32&c)?2:2048)!==e&&Zt(r,c),Object.freeze(r)):(l===2&&br(c)&&(Zt(r=Fn(r),c=es(c=Ar(c,e),e,s)),e=Vt(t,e,i,r)),br(c)||(i=c,(c=es(c,e,s))!==i&&Zt(r,c))),r}function Rr(t,e,n){let i=0|t.u[Le];return _1(t,i,e,n,qs(),!1,!(2&i))}function Ne(t,e,n,i){return i==null&&(i=void 0),Rt(t,n,i)}function Vl(t,e,n,i){i==null&&(i=void 0);e:{let r=0|(t=t.u)[Le];if(rs(r),i==null){let s=ug(t);if(hg(s,t,r,n)!==e)break e;s.set(n,0)}else r=m1(t,r,n,e);Vt(t,r,e,i)}}function Ar(t,e){return-2049&(t=32|(2&e?2|t:-3&t))}function es(t,e,n){return 32&e&&n||(t&=-33),t}function Uh(t,e,n,i){let r=0|t.u[Le];rs(r),t=_1(t,r,n,e,2,!0),i=i??new n,t.push(i),t[Le]=2&(0|i.u[Le])?-9&t[Le]:-17&t[Le]}function fi(t,e){return ya(fa(t,e))}function mi(t,e){return da(fa(t,e))}function Xt(t,e){return Eh(t,e)??0}function ql(t,e,n){if(n!=null&&typeof n!="boolean")throw t=typeof n,Error(`Expected boolean but got ${t!="object"?t:n?Array.isArray(n)?"array":t:"null"}: ${n}`);Rt(t,e,n)}function er(t,e,n){if(n!=null){if(typeof n!="number"||!Gh(n))throw bm("int32");n|=0}Rt(t,e,n)}function Ce(t,e,n){if(n!=null&&typeof n!="number")throw Error(`Value of float/double field must be a number, found ${typeof n}: ${n}`);Rt(t,e,n)}function Nh(t,e,n){{let o=t.u,a=0|o[Le];if(rs(a),n==null)Vt(o,a,e);else{var i=t=0|n[Le],r=br(t),s=r||Object.isFrozen(n);for(r||(t=0),s||(n=Fn(n),i=0,t=es(t=Ar(t,a),a,!0),s=!1),t|=21,r=0;r<n.length;r++){let l=n[r],c=l1(l);Object.is(l,c)||(s&&(n=Fn(n),i=0,t=es(t=Ar(t,a),a,!0),s=!1),n[r]=c)}t!==i&&(s&&(n=Fn(n),t=es(t=Ar(t,a),a,!0)),Zt(n,t)),Vt(o,a,e,n)}}}function Yh(t,e,n){rs(0|t.u[Le]),Ys(t,e,da,2,!0).push(l1(n))}function v1(t,e){return Error(`Invalid wire type: ${t} (at position ${e})`)}function fg(){return Error("Failed to read varint, encoding is invalid.")}function x1(t,e){return Error(`Tried to read past the end of the data ${e} > ${t}`)}function pg(t){if(typeof t=="string")return{buffer:Qy(t),N:!1};if(Array.isArray(t))return{buffer:new Uint8Array(t),N:!1};if(t.constructor===Uint8Array)return{buffer:t,N:!1};if(t.constructor===ArrayBuffer)return{buffer:new Uint8Array(t),N:!1};if(t.constructor===wr)return{buffer:qm(t)||new Uint8Array(0),N:!0};if(t instanceof Uint8Array)return{buffer:new Uint8Array(t.buffer,t.byteOffset,t.byteLength),N:!1};throw Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, a ByteString or an Array of numbers")}function mg(t,e){let n,i=0,r=0,s=0,o=t.h,a=t.g;do n=o[a++],i|=(127&n)<<s,s+=7;while(s<32&&128&n);for(s>32&&(r|=(127&n)>>4),s=3;s<32&&128&n;s+=7)n=o[a++],r|=(127&n)<<s;if($s(t,a),n<128)return e(i>>>0,r>>>0);throw fg()}function gg(t){let e=0,n=t.g,i=n+10,r=t.h;for(;n<i;){let s=r[n++];if(e|=s,(128&s)==0)return $s(t,n),!!(127&e)}throw fg()}function ts(t){let e=t.h,n=t.g,i=e[n++],r=127&i;if(128&i&&(i=e[n++],r|=(127&i)<<7,128&i&&(i=e[n++],r|=(127&i)<<14,128&i&&(i=e[n++],r|=(127&i)<<21,128&i&&(i=e[n++],r|=i<<28,128&i&&128&e[n++]&&128&e[n++]&&128&e[n++]&&128&e[n++]&&128&e[n++])))))throw fg();return $s(t,n),r}function Cr(t){return ts(t)>>>0}function Im(t){var e=t.h;let n=t.g,i=e[n],r=e[n+1],s=e[n+2];return e=e[n+3],$s(t,t.g+4),(i<<0|r<<8|s<<16|e<<24)>>>0}function Pm(t){var e=Im(t);t=2*(e>>31)+1;let n=e>>>23&255;return e&=8388607,n==255?e?NaN:t*(1/0):n==0?1401298464324817e-60*t*e:t*Math.pow(2,n-150)*(e+8388608)}function oC(t){return ts(t)}function _m(t,e,{ba:n=!1}={}){t.ba=n,e&&(e=pg(e),t.h=e.buffer,t.m=e.N,t.j=0,t.l=t.h.length,t.g=t.j)}function $s(t,e){if(t.g=e,e>t.l)throw x1(t.l,e)}function y1(t,e){if(e<0)throw Error(`Tried to read a negative byte length: ${e}`);let n=t.g,i=n+e;if(i>t.l)throw x1(e,t.l-n);return t.g=i,n}function M1(t,e){if(e==0)return Zs();var n=y1(t,e);return t.ba&&t.m?n=t.h.subarray(n,n+e):(t=t.h,n=n===(e=n+e)?new Uint8Array(0):YR?t.slice(n,e):new Uint8Array(t.subarray(n,e))),n.length==0?Zs():new wr(n,ca)}pi.prototype.toJSON=void 0,pi.prototype.Ia=r1;var Jx=[];function E1(t){var e=t.g;if(e.g==e.l)return!1;t.l=t.g.g;var n=Cr(t.g);if(e=n>>>3,!((n&=7)>=0&&n<=5))throw v1(n,t.l);if(e<1)throw Error(`Invalid field number: ${e} (at position ${t.l})`);return t.m=e,t.h=n,!0}function Sh(t){switch(t.h){case 0:t.h!=0?Sh(t):gg(t.g);break;case 1:$s(t=t.g,t.g+8);break;case 2:if(t.h!=2)Sh(t);else{var e=Cr(t.g);$s(t=t.g,t.g+e)}break;case 5:$s(t=t.g,t.g+4);break;case 3:for(e=t.m;;){if(!E1(t))throw Error("Unmatched start-group tag: stream EOF");if(t.h==4){if(t.m!=e)throw Error("Unmatched end-group tag");break}Sh(t)}break;default:throw v1(t.h,t.l)}}function Jl(t,e,n){let i=t.g.l,r=Cr(t.g),s=t.g.g+r,o=s-i;if(o<=0&&(t.g.l=s,n(e,t,void 0,void 0,void 0),o=s-t.g.g),o)throw Error(`Message parsing ended unexpectedly. Expected to read ${r} bytes, instead read ${r-o} bytes, either the data ended unexpectedly or the message misreported its own length`);return t.g.g=s,t.g.l=i,e}function _g(t){var e=Cr(t.g),n=y1(t=t.g,e);if(t=t.h,RR){var i,r=t;(i=hm)||(i=hm=new TextDecoder("utf-8",{fatal:!0})),e=n+e,r=n===0&&e===r.length?r:r.subarray(n,e);try{var s=i.decode(r)}catch(a){if(mh===void 0){try{i.decode(new Uint8Array([128]))}catch{}try{i.decode(new Uint8Array([97])),mh=!0}catch{mh=!1}}throw!mh&&(hm=void 0),a}}else{e=(s=n)+e,n=[];let a,l=null;for(;s<e;){var o=t[s++];o<128?n.push(o):o<224?s>=e?Xs():(a=t[s++],o<194||(192&a)!=128?(s--,Xs()):n.push((31&o)<<6|63&a)):o<240?s>=e-1?Xs():(a=t[s++],(192&a)!=128||o===224&&a<160||o===237&&a>=160||(192&(i=t[s++]))!=128?(s--,Xs()):n.push((15&o)<<12|(63&a)<<6|63&i)):o<=244?s>=e-2?Xs():(a=t[s++],(192&a)!=128||a-144+(o<<28)>>30!=0||(192&(i=t[s++]))!=128||(192&(r=t[s++]))!=128?(s--,Xs()):(o=(7&o)<<18|(63&a)<<12|(63&i)<<6|63&r,o-=65536,n.push(55296+(o>>10&1023),56320+(1023&o)))):Xs(),n.length>=8192&&(l=Ox(l,n),n.length=0)}s=Ox(l,n)}return s}function S1(t){let e=Cr(t.g);return M1(t.g,e)}function $h(t,e,n){var i=Cr(t.g);for(i=t.g.g+i;t.g.g<i;)n.push(e(t.g))}var vh=[];function aC(t){return t}var sa;function Pi(t,e,n){e.g?e.m(t,e.g,e.h,n):e.m(t,e.h,n)}var Se=class{constructor(t,e){this.u=d1(t,e)}toJSON(){let t=!sa;try{return t&&(sa=h1),T1(this)}finally{t&&(sa=void 0)}}l(){var t=zC;return t.g?t.l(this,t.g,t.h,!0):t.l(this,t.h,t.defaultValue,!0)}clone(){let t=this.u;return new this.constructor(Xh(t,0|t[Le],!1))}N(){return!!(2&(0|this.u[Le]))}};function T1(t){var e=t.u;{e=(t=sa(e))!==e;let c=t.length;if(c){var n=t[c-1],i=jm(n);i?c--:n=void 0;var r=t;if(i){e:{var s,o=n,a=!1;if(o)for(let u in o)isNaN(+u)?(s??={})[u]=o[u]:(i=o[u],Array.isArray(i)&&(Ch(i)||zx(i)&&i.size===0)&&(i=null),i==null&&(a=!0),i!=null&&((s??={})[u]=i));if(a||(s=o),s)for(let u in s){a=s;break e}a=null}o=a==null?n!=null:a!==n}for(;c>0&&((s=r[c-1])==null||Ch(s)||zx(s)&&s.size===0);c--)var l=!0;(r!==t||o||l)&&(e?(l||o||a)&&(r.length=c):r=Array.prototype.slice.call(r,0,c),a&&r.push(a)),l=r}else l=t}return l}function Qx(t){return t?/^\d+$/.test(t)?(zh(t),new Lm(wt,Gt)):null:lC||=new Lm(0,0)}Se.prototype.W=Kl,Se.prototype.toString=function(){try{return sa=aC,T1(this).toString()}finally{sa=void 0}};var Lm=class{constructor(t,e){this.h=t>>>0,this.g=e>>>0}},lC;function ey(t){return t?/^-?\d+$/.test(t)?(zh(t),new Um(wt,Gt)):null:cC||=new Um(0,0)}var Um=class{constructor(t,e){this.h=t>>>0,this.g=e>>>0}},cC;function oa(t,e,n){for(;n>0||e>127;)t.g.push(127&e|128),e=(e>>>7|n<<25)>>>0,n>>>=7;t.g.push(e)}function Sa(t,e){for(;e>127;)t.g.push(127&e|128),e>>>=7;t.g.push(e)}function jh(t,e){if(e>=0)Sa(t,e);else{for(let n=0;n<9;n++)t.g.push(127&e|128),e>>=7;t.g.push(1)}}function Yl(t,e){t.g.push(e>>>0&255),t.g.push(e>>>8&255),t.g.push(e>>>16&255),t.g.push(e>>>24&255)}function pa(t,e){e.length!==0&&(t.l.push(e),t.h+=e.length)}function Kn(t,e,n){Sa(t.g,8*e+n)}function vg(t,e){return Kn(t,e,2),e=t.g.end(),pa(t,e),e.push(t.h),e}function xg(t,e){var n=e.pop();for(n=t.h+t.g.length()-n;n>127;)e.push(127&n|128),n>>>=7,t.h++;e.push(n),t.h++}function Zh(t,e,n){Kn(t,e,2),Sa(t.g,n.length),pa(t,t.g.end()),pa(t,n)}function Dh(t,e,n,i){n!=null&&(e=vg(t,e),i(n,t),xg(t,e))}function Li(){let t=class{constructor(){throw Error()}};return Object.setPrototypeOf(t,t.prototype),t}var yg=Li(),b1=Li(),Mg=Li(),Eg=Li(),w1=Li(),A1=Li(),Sg=Li(),R1=Li(),C1=Li(),Ta=class{constructor(t,e,n){this.g=t,this.h=e,t=yg,this.l=!!t&&n===t||!1}};function Kh(t,e){return new Ta(t,e,yg)}function I1(t,e,n,i,r){Dh(t,n,N1(e,i),r)}var uC=Kh(function(t,e,n,i,r){return t.h===2&&(Jl(t,dg(e,i,n),r),!0)},I1),hC=Kh(function(t,e,n,i,r){return t.h===2&&(Jl(t,dg(e,i,n,!0),r),!0)},I1),Jh=Symbol(),Tg=Symbol(),ty=Symbol(),ny=Symbol(),P1,L1;function Ks(t,e,n,i){var r=i[t];if(r)return r;(r={}).Pa=i,r.V=function(h){switch(typeof h){case"boolean":return c1||=[0,void 0,!0];case"number":return h>0?void 0:h===0?rC||=[0,void 0]:[-h,void 0];case"string":return[0,h];case"object":return h}}(i[0]);var s=i[1];let o=1;s&&s.constructor===Object&&(r.ga=s,typeof(s=i[++o])=="function"&&(r.la=!0,P1??=s,L1??=i[o+1],s=i[o+=2]));let a={};for(;s&&Array.isArray(s)&&s.length&&typeof s[0]=="number"&&s[0]>0;){for(var l=0;l<s.length;l++)a[s[l]]=s;s=i[++o]}for(l=1;s!==void 0;){let h;typeof s=="number"&&(l+=s,s=i[++o]);var c=void 0;if(s instanceof Ta?h=s:(h=uC,o--),h?.l){s=i[++o],c=i;var u=o;typeof s=="function"&&(s=s(),c[u]=s),c=s}for(u=l+1,typeof(s=i[++o])=="number"&&s<0&&(u-=s,s=i[++o]);l<u;l++){let d=a[l];c?n(r,l,h,c,d):e(r,l,h,d)}}return i[t]=r}function U1(t){return Array.isArray(t)?t[0]instanceof Ta?t:[hC,t]:[t,void 0]}function N1(t,e){return t instanceof Se?t.u:Array.isArray(t)?Qr(t,e,!1):void 0}function bg(t,e,n,i){let r=n.g;t[e]=i?(s,o,a)=>r(s,o,a,i):r}function wg(t,e,n,i,r){let s=n.g,o,a;t[e]=(l,c,u)=>s(l,c,u,a||=Ks(Tg,bg,wg,i).V,o||=Ag(i),r)}function Ag(t){let e=t[ty];if(e!=null)return e;let n=Ks(Tg,bg,wg,t);return e=n.la?(i,r)=>P1(i,r,n):(i,r)=>{let s=0|i[Le];for(;E1(r)&&r.h!=4;){var o=r.m,a=n[o];if(a==null){var l=n.ga;l&&(l=l[o])&&(l=dC(l))!=null&&(a=n[o]=l)}a!=null&&a(r,i,o)||(o=(a=r).l,Sh(a),a.fa?a=void 0:(l=a.g.g-o,a.g.g=o,a=M1(a.g,l)),o=i,a&&((l=o[ua])?l.push(a):o[ua]=[a]))}return 16384&s&&xa(i),!0},t[ty]=e}function dC(t){let e=(t=U1(t))[0].g;if(t=t[1]){let n=Ag(t),i=Ks(Tg,bg,wg,t).V;return(r,s,o)=>e(r,s,o,i,n)}return e}function Qh(t,e,n){t[e]=n.h}function ed(t,e,n,i){let r,s,o=n.h;t[e]=(a,l,c)=>o(a,l,c,s||=Ks(Jh,Qh,ed,i).V,r||=D1(i))}function D1(t){let e=t[ny];if(!e){let n=Ks(Jh,Qh,ed,t);e=(i,r)=>O1(i,r,n),t[ny]=e}return e}function O1(t,e,n){for(var i=0|t[Le],r=512&i?0:-1,s=t.length,o=512&i?1:0,a=s+(256&i?-1:0);o<a;o++){let l=t[o];if(l==null)continue;let c=o-r,u=iy(n,c);u&&u(e,l,c)}if(256&i){i=t[s-1];for(let l in i)r=+l,Number.isNaN(r)||(s=i[r])!=null&&(a=iy(n,r))&&a(e,s,r)}if(t=Km(t))for(pa(e,e.g.end()),n=0;n<t.length;n++)pa(e,qm(t[n])||new Uint8Array(0))}function iy(t,e){var n=t[e];if(n)return n;if((n=t.ga)&&(n=n[e])){var i=(n=U1(n))[0].h;if(n=n[1]){let r=D1(n),s=Ks(Jh,Qh,ed,n).V;n=t.la?L1(s,r):(o,a,l)=>i(o,a,l,s,r)}else n=i;return t[e]=n}}function ba(t,e){if(Array.isArray(e)){var n=0|e[Le];if(4&n)return e;for(var i=0,r=0;i<e.length;i++){let s=t(e[i]);s!=null&&(e[r++]=s)}return r<i&&(e.length=r),Zt(e,-12289&(5|n)),2&n&&Object.freeze(e),e}}function Rn(t,e,n){return new Ta(t,e,n)}function wa(t,e,n){return new Ta(t,e,n)}function Cn(t,e,n){Vt(t,0|t[Le],e,n)}var fC=Kh(function(t,e,n,i,r){return t.h===2&&(t=Jl(t,Qr([void 0,void 0],i,!0),r),rs(i=0|e[Le]),(r=Ir(e,i,n))instanceof pi?(2&r.L)!=0?((r=r.X()).push(t),Vt(e,i,n,r)):r.Na(t):Array.isArray(r)?(2&(0|r[Le])&&Vt(e,i,n,r=p1(r)),r.push(t)):Vt(e,i,n,[t]),!0)},function(t,e,n,i,r){if(e instanceof pi)e.forEach((s,o)=>{Dh(t,n,Qr([o,s],i,!1),r)});else if(Array.isArray(e))for(let s=0;s<e.length;s++){let o=e[s];Array.isArray(o)&&Dh(t,n,Qr(o,i,!1),r)}});function F1(t,e,n){if(e=function(i){if(i==null)return i;let r=typeof i;if(r==="bigint")return String(ng(64,i));if(Wh(i)){if(r==="string")return rg(i);if(r==="number")return ig(i)}}(e),e!=null&&(typeof e=="string"&&ey(e),e!=null))switch(Kn(t,n,0),typeof e){case"number":t=t.g,ha(e),oa(t,wt,Gt);break;case"bigint":n=BigInt.asUintN(64,e),n=new Um(Number(n&BigInt(4294967295)),Number(n>>BigInt(32))),oa(t.g,n.h,n.g);break;default:n=ey(e),oa(t.g,n.h,n.g)}}function B1(t,e,n){(e=ya(e))!=null&&e!=null&&(Kn(t,n,0),jh(t.g,e))}function k1(t,e,n){(e=o1(e))!=null&&(Kn(t,n,0),t.g.g.push(e?1:0))}function H1(t,e,n){(e=da(e))!=null&&Zh(t,n,$y(e))}function V1(t,e,n,i,r){Dh(t,n,N1(e,i),r)}function z1(t,e,n){(e=e==null||typeof e=="string"||jl(e)||e instanceof wr?e:void 0)!=null&&Zh(t,n,pg(e).buffer)}function G1(t,e,n){return(t.h===5||t.h===2)&&(e=Ea(e,0|e[Le],n,!1,!1),t.h==2?$h(t,Pm,e):e.push(Pm(t.g)),!0)}var Sr=Rn(function(t,e,n){if(t.h!==1)return!1;var i=t.g;t=Im(i);let r=Im(i);i=2*(r>>31)+1;let s=r>>>20&2047;return t=4294967296*(1048575&r)+t,Cn(e,n,s==2047?t?NaN:i*(1/0):s==0?5e-324*i*t:i*Math.pow(2,s-1075)*(t+4503599627370496)),!0},function(t,e,n){(e=ss(e))!=null&&(Kn(t,n,1),t=t.g,(n=s1||=new DataView(new ArrayBuffer(8))).setFloat64(0,+e,!0),wt=n.getUint32(0,!0),Gt=n.getUint32(4,!0),Yl(t,wt),Yl(t,Gt))},Li()),Kt=Rn(function(t,e,n){return t.h===5&&(Cn(e,n,Pm(t.g)),!0)},function(t,e,n){(e=ss(e))!=null&&(Kn(t,n,5),t=t.g,Jm(e),Yl(t,wt))},Sg),pC=wa(G1,function(t,e,n){if((e=ba(ss,e))!=null)for(let o=0;o<e.length;o++){var i=t,r=n,s=e[o];s!=null&&(Kn(i,r,5),i=i.g,Jm(s),Yl(i,wt))}},Sg),Rg=wa(G1,function(t,e,n){if((e=ba(ss,e))!=null&&e.length){Kn(t,n,2),Sa(t.g,4*e.length);for(let i=0;i<e.length;i++)n=t.g,Jm(e[i]),Yl(n,wt)}},Sg),ns=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,mg(t.g,eg)),!0)},F1,A1),vm=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,(t=mg(t.g,eg))===0?void 0:t),!0)},F1,A1),mC=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,mg(t.g,Qm)),!0)},function(t,e,n){if((e=ZR(e))!=null&&(typeof e=="string"&&Qx(e),e!=null))switch(Kn(t,n,0),typeof e){case"number":t=t.g,ha(e),oa(t,wt,Gt);break;case"bigint":n=BigInt.asUintN(64,e),n=new Lm(Number(n&BigInt(4294967295)),Number(n>>BigInt(32))),oa(t.g,n.h,n.g);break;default:n=Qx(e),oa(t.g,n.h,n.g)}},Li()),Wt=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,ts(t.g)),!0)},B1,Eg),td=wa(function(t,e,n){return(t.h===0||t.h===2)&&(e=Ea(e,0|e[Le],n,!1,!1),t.h==2?$h(t,ts,e):e.push(ts(t.g)),!0)},function(t,e,n){if((e=ba(ya,e))!=null&&e.length){n=vg(t,n);for(let i=0;i<e.length;i++)jh(t.g,e[i]);xg(t,n)}},Eg),ia=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,(t=ts(t.g))===0?void 0:t),!0)},B1,Eg),Dt=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,gg(t.g)),!0)},k1,b1),aa=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,(t=gg(t.g))===!1?void 0:t),!0)},k1,b1),_n=wa(function(t,e,n){return t.h===2&&(t=_g(t),Ea(e,0|e[Le],n,!1).push(t),!0)},function(t,e,n){if((e=ba(da,e))!=null)for(let o=0;o<e.length;o++){var i=t,r=n,s=e[o];s!=null&&Zh(i,r,$y(s))}},Mg),Jr=Rn(function(t,e,n){return t.h===2&&(Cn(e,n,(t=_g(t))===""?void 0:t),!0)},H1,Mg),vt=Rn(function(t,e,n){return t.h===2&&(Cn(e,n,_g(t)),!0)},H1,Mg),rn=function(t,e,n=yg){return new Ta(t,e,n)}(function(t,e,n,i,r){return t.h===2&&(i=Qr(void 0,i,!0),Ea(e,0|e[Le],n,!0).push(i),Jl(t,i,r),!0)},function(t,e,n,i,r){if(Array.isArray(e))for(let s=0;s<e.length;s++)V1(t,e[s],n,i,r)}),Et=Kh(function(t,e,n,i,r,s){return t.h===2&&(m1(e,0|e[Le],s,n),Jl(t,e=dg(e,i,n),r),!0)},V1),W1=Rn(function(t,e,n){return t.h===2&&(Cn(e,n,S1(t)),!0)},z1,R1),gC=wa(function(t,e,n){return(t.h===0||t.h===2)&&(e=Ea(e,0|e[Le],n,!1,!1),t.h==2?$h(t,Cr,e):e.push(Cr(t.g)),!0)},function(t,e,n){if((e=ba(a1,e))!=null)for(let o=0;o<e.length;o++){var i=t,r=n,s=e[o];s!=null&&(Kn(i,r,0),Sa(i.g,s))}},w1),_C=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,(t=Cr(t.g))===0?void 0:t),!0)},function(t,e,n){(e=a1(e))!=null&&e!=null&&(Kn(t,n,0),Sa(t.g,e))},w1),gi=Rn(function(t,e,n){return t.h===0&&(Cn(e,n,ts(t.g)),!0)},function(t,e,n){(e=ya(e))!=null&&(e=parseInt(e,10),Kn(t,n,0),jh(t.g,e))},C1),Nm=class{constructor(e,n){this.h=e,this.g=n,this.l=lt,this.m=Ne,this.defaultValue=void 0}};function Ui(t,e){return new Nm(t,e)}function os(t,e){return(n,i)=>{if(vh.length){let s=vh.pop();s.o(i),_m(s.g,n,i),n=s}else n=new class{constructor(s,o){if(Jx.length){let a=Jx.pop();_m(a,s,o),s=a}else s=new class{constructor(a,l){this.h=null,this.m=!1,this.g=this.l=this.j=0,_m(this,a,l)}clear(){this.h=null,this.m=!1,this.g=this.l=this.j=0,this.ba=!1}}(s,o);this.g=s,this.l=this.g.g,this.h=this.m=-1,this.o(o)}o({fa:s=!1}={}){this.fa=s}}(n,i);try{let s=new t,o=s.u;Ag(e)(o,n);var r=s}finally{n.g.clear(),n.m=-1,n.h=-1,vh.length<100&&vh.push(n)}return r}}function nd(t){return function(){let e=new class{constructor(){this.l=[],this.h=0,this.g=new class{constructor(){this.g=[]}length(){return this.g.length}end(){let o=this.g;return this.g=[],o}}}};O1(this.u,e,Ks(Jh,Qh,ed,t)),pa(e,e.g.end());let n=new Uint8Array(e.h),i=e.l,r=i.length,s=0;for(let o=0;o<r;o++){let a=i[o];n.set(a,s),s+=a.length}return e.l=[n],n}}var ry=class extends Se{constructor(t){super(t)}},sy=[0,Jr,Rn(function(t,e,n){return t.h===2&&(Cn(e,n,(t=S1(t))===Zs()?void 0:t),!0)},function(t,e,n){if(e!=null){if(e instanceof Se){let i=e.Ra;return void(i&&(e=i(e),e!=null&&Zh(t,n,pg(e).buffer)))}if(Array.isArray(e))return}z1(t,e,n)},R1)],xm,oy=globalThis.trustedTypes;function ay(t){xm===void 0&&(xm=function(){let n=null;if(!oy)return n;try{let i=r=>r;n=oy.createPolicy("goog#html",{createHTML:i,createScript:i,createScriptURL:i})}catch{}return n}());var e=xm;return new class{constructor(n){this.g=n}toString(){return this.g+""}}(e?e.createScriptURL(t):t)}function vC(t,...e){if(e.length===0)return ay(t[0]);let n=t[0];for(let i=0;i<e.length;i++)n+=encodeURIComponent(e[i])+t[i+1];return ay(n)}var X1=[0,Wt,gi,Dt,-1,td,gi,-1],xC=class extends Se{constructor(t){super(t)}},q1=[0,Dt,vt,Dt,gi,-1,wa(function(t,e,n){return(t.h===0||t.h===2)&&(e=Ea(e,0|e[Le],n,!1,!1),t.h==2?$h(t,oC,e):e.push(ts(t.g)),!0)},function(t,e,n){if((e=ba(ya,e))!=null&&e.length){n=vg(t,n);for(let i=0;i<e.length;i++)jh(t.g,e[i]);xg(t,n)}},C1),vt,-1,[0,Dt,-1],gi,Dt,-1],Y1=[0,vt,-2],ly=class extends Se{constructor(t){super(t)}},$1=[0],j1=[0,Wt,Dt,1,Dt,-3],Zn=class extends Se{constructor(t){super(t,2)}},Jt={};Jt[336783863]=[0,vt,Dt,-1,Wt,[0,[1,2,3,4,5,6,7,8],Et,$1,Et,q1,Et,Y1,Et,j1,Et,X1,Et,[0,vt,-2],Et,[0,vt,gi],Et,[0,gi,vt]],[0,vt],Dt,[0,[1,3],[2,4],Et,[0,td],-1,Et,[0,_n],-1,rn,[0,vt,-1]],vt];var cy=[0,vm,-1,aa,-3,vm,td,Jr,ia,vm,-1,aa,ia,aa,-2,Jr];function Jn(t,e){Cm(t,2,Ma(e),"")}function Ct(t,e){Yh(t,3,e)}function rt(t,e){Yh(t,4,e)}var An=class extends Se{constructor(t){super(t,500)}o(t){return Ne(this,0,7,t)}},zl=[-1,{}],uy=[0,vt,1,zl],hy=[0,vt,_n,zl];function Qn(t,e){Uh(t,1,An,e)}function Pt(t,e){Yh(t,10,e)}function ft(t,e){Yh(t,15,e)}var kn=class extends Se{constructor(t){super(t,500)}o(t){return Ne(this,0,1001,t)}},Z1=[-500,rn,[-500,Jr,-1,_n,-3,[-2,Jt,Dt],rn,sy,ia,-1,uy,hy,rn,[0,Jr,aa],Jr,cy,ia,_n,987,_n],4,rn,[-500,vt,-1,[-1,{}],998,vt],rn,[-500,vt,_n,-1,[-2,{},Dt],997,_n,-1],ia,rn,[-500,vt,_n,zl,998,_n],_n,ia,uy,hy,rn,[0,Jr,-1,zl],_n,-2,cy,Jr,-1,aa,[0,aa,_C],978,zl,rn,sy];kn.prototype.g=nd(Z1);var yC=os(kn,Z1),MC=class extends Se{constructor(t){super(t)}},K1=class extends Se{constructor(t){super(t)}g(){return Rr(this,MC,1)}},J1=[0,rn,[0,Wt,Kt,vt,-1]],id=os(K1,J1),EC=class extends Se{constructor(t){super(t)}},SC=class extends Se{constructor(t){super(t)}},ym=class extends Se{constructor(t){super(t)}h(){return lt(this,EC,2)}g(){return Rr(this,SC,5)}},Q1=os(class extends Se{constructor(t){super(t)}},[0,_n,td,Rg,[0,gi,[0,Wt,-3],[0,Kt,-3],[0,Wt,-1,[0,rn,[0,Wt,-2]]],rn,[0,Kt,-1,vt,Kt]],vt,-1,ns,rn,[0,Wt,Kt],_n,ns]),eM=class extends Se{constructor(t){super(t)}},la=os(class extends Se{constructor(t){super(t)}},[0,rn,[0,Kt,-4]]),tM=class extends Se{constructor(t){super(t)}},Ql=os(class extends Se{constructor(t){super(t)}},[0,rn,[0,Kt,-4]]),TC=class extends Se{constructor(t){super(t)}},bC=[0,Wt,-1,Rg,gi],nM=class extends Se{constructor(t){super(t)}};nM.prototype.g=nd([0,Kt,-4,ns]);var wC=class extends Se{constructor(t){super(t)}},AC=os(class extends Se{constructor(t){super(t)}},[0,rn,[0,1,Wt,vt,J1],ns]),dy=class extends Se{constructor(t){super(t)}},RC=class extends Se{constructor(t){super(t)}oa(){let t=f1(this);return t??Zs()}},CC=class extends Se{constructor(t){super(t)}},iM=[1,2],IC=os(class extends Se{constructor(t){super(t)}},[0,rn,[0,iM,Et,[0,Rg],Et,[0,W1],Wt,vt],ns]),Cg=class extends Se{constructor(t){super(t)}},rM=[0,vt,Wt,Kt,_n,-1],fy=class extends Se{constructor(t){super(t)}},PC=[0,Dt,-1],py=class extends Se{constructor(t){super(t)}},Th=[1,2,3,4,5],Oh=class extends Se{constructor(t){super(t)}g(){return f1(this)!=null}h(){return mi(this,2)!=null}},Ot=class extends Se{constructor(t){super(t)}g(){return o1(fa(this,2))??!1}},sM=[0,W1,vt,[0,Wt,ns,-1],[0,mC,ns]],qt=[0,sM,Dt,[0,Th,Et,j1,Et,q1,Et,X1,Et,$1,Et,Y1],gi],rd=class extends Se{constructor(t){super(t)}},Ig=[0,qt,Kt,-1,Wt],LC=Ui(502141897,rd);Jt[502141897]=Ig;var UC=os(class extends Se{constructor(t){super(t)}},[0,[0,gi,-1,pC,gC],bC]),oM=class extends Se{constructor(t){super(t)}},aM=class extends Se{constructor(t){super(t)}},Pg=[0,qt,Kt,[0,qt],Dt],lM=[0,qt,Ig,Pg,Kt,[0,[0,sM]]],NC=Ui(508968150,aM);Jt[508968150]=lM,Jt[508968149]=Pg;var cM=class extends Se{constructor(t){super(t)}},DC=Ui(513916220,cM);Jt[513916220]=[0,qt,lM,Wt];var ta=class extends Se{constructor(t){super(t)}h(){return lt(this,Cg,2)}g(){Rt(this,2)}},uM=[0,qt,rM];Jt[478825465]=uM;var OC=class extends Se{constructor(t){super(t)}},hM=class extends Se{constructor(t){super(t)}},Lg=class extends Se{constructor(t){super(t)}},Ug=class extends Se{constructor(t){super(t)}},dM=class extends Se{constructor(t){super(t)}},my=[0,qt,[0,qt],uM,-1],fM=[0,qt,Kt,Wt],Ng=[0,qt,Kt],pM=[0,qt,fM,Ng,Kt],FC=Ui(479097054,dM);Jt[479097054]=[0,qt,pM,my],Jt[463370452]=my,Jt[464864288]=fM;var BC=Ui(462713202,Ug);Jt[462713202]=pM,Jt[474472470]=Ng;var kC=class extends Se{constructor(t){super(t)}},mM=class extends Se{constructor(t){super(t)}},gM=class extends Se{constructor(t){super(t)}},_M=class extends Se{constructor(t){super(t)}},Dg=[0,qt,Kt,-1,Wt],Dm=[0,qt,Kt,Dt];_M.prototype.g=nd([0,qt,Ng,[0,qt],Ig,Pg,Dg,Dm]);var vM=class extends Se{constructor(t){super(t)}},HC=Ui(456383383,vM);Jt[456383383]=[0,qt,rM];var xM=class extends Se{constructor(t){super(t)}},VC=Ui(476348187,xM);Jt[476348187]=[0,qt,PC];var yM=class extends Se{constructor(t){super(t)}},gy=class extends Se{constructor(t){super(t)}},MM=[0,gi,-1],zC=Ui(458105876,class extends Se{constructor(t){super(t)}g(){var t=this.u;let e=0|t[Le],n=2&e;return t=function(i,r,s){var o=gy;let a=2&r,l=!1;if(s==null){if(a)return Kx();s=[]}else if(s.constructor===pi){if((2&s.L)==0||a)return s;s=s.X()}else Array.isArray(s)?l=!!(2&(0|s[Le])):s=[];if(a){if(!s.length)return Kx();l||(l=!0,xa(s))}else l&&(l=!1,s=p1(s));return l||(64&(0|s[Le])?s[Le]&=-33:32&r&&kh(s,32)),Vt(i,r,2,o=new pi(s,o,KR,void 0)),o}(t,e,Ir(t,e,2)),!n&&gy&&(t.ra=!0),t}});Jt[458105876]=[0,MM,fC,[!0,ns,[0,vt,-1,_n]]];var Og=class extends Se{constructor(t){super(t)}},EM=Ui(458105758,Og);Jt[458105758]=[0,qt,vt,MM];var SM=class extends Se{constructor(t){super(t)}},GC=Ui(443442058,SM);Jt[443442058]=[0,qt,vt,Wt,Kt,_n,-1,Dt,Kt],Jt[514774813]=Dg;var TM=class extends Se{constructor(t){super(t)}},WC=Ui(516587230,TM);function Om(t,e){return e=e?e.clone():new Cg,t.displayNamesLocale!==void 0?Rt(e,1,Ma(t.displayNamesLocale)):t.displayNamesLocale===void 0&&Rt(e,1),t.maxResults!==void 0?er(e,2,t.maxResults):"maxResults"in t&&Rt(e,2),t.scoreThreshold!==void 0?Ce(e,3,t.scoreThreshold):"scoreThreshold"in t&&Rt(e,3),t.categoryAllowlist!==void 0?Nh(e,4,t.categoryAllowlist):"categoryAllowlist"in t&&Rt(e,4),t.categoryDenylist!==void 0?Nh(e,5,t.categoryDenylist):"categoryDenylist"in t&&Rt(e,5),e}function Fg(t,e=-1,n=""){return{categories:t.map(i=>({index:fi(i,1)??0??-1,score:Xt(i,2)??0,categoryName:mi(i,3)??""??"",displayName:mi(i,4)??""??""})),headIndex:e,headName:n}}function bM(t){var e=Ys(t,3,ss,qs()),n=Ys(t,2,ya,qs()),i=Ys(t,1,da,qs()),r=Ys(t,9,da,qs());let s={categories:[],keypoints:[]};for(let o=0;o<e.length;o++)s.categories.push({score:e[o],index:n[o]??-1,categoryName:i[o]??"",displayName:r[o]??""});if((e=lt(t,ym,4)?.h())&&(s.boundingBox={originX:fi(e,1)??0,originY:fi(e,2)??0,width:fi(e,3)??0,height:fi(e,4)??0,angle:0}),lt(t,ym,4)?.g().length)for(let o of lt(t,ym,4).g())s.keypoints.push({x:Eh(o,1)??0,y:Eh(o,2)??0,score:Eh(o,4)??0,label:mi(o,3)??""});return s}function sd(t){let e=[];for(let n of Rr(t,tM,1))e.push({x:Xt(n,1)??0,y:Xt(n,2)??0,z:Xt(n,3)??0,visibility:Xt(n,4)??0});return e}function Gl(t){let e=[];for(let n of Rr(t,eM,1))e.push({x:Xt(n,1)??0,y:Xt(n,2)??0,z:Xt(n,3)??0,visibility:Xt(n,4)??0});return e}function _y(t){return Array.from(t,e=>e>127?e-256:e)}function vy(t,e){if(t.length!==e.length)throw Error(`Cannot compute cosine similarity between embeddings of different sizes (${t.length} vs. ${e.length}).`);let n=0,i=0,r=0;for(let s=0;s<t.length;s++)n+=t[s]*e[s],i+=t[s]*t[s],r+=e[s]*e[s];if(i<=0||r<=0)throw Error("Cannot compute cosine similarity on embedding with 0 norm.");return n/Math.sqrt(i*r)}var xh;Jt[516587230]=[0,qt,Dg,Dm,Kt],Jt[518928384]=Dm;var XC=new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]);async function wM(){if(xh===void 0)try{await WebAssembly.instantiate(XC),xh=!0}catch{xh=!1}return xh}async function Ol(t,e=vC``){let n=await wM()?"wasm_internal":"wasm_nosimd_internal";return{wasmLoaderPath:`${e}/${t}_${n}.js`,wasmBinaryPath:`${e}/${t}_${n}.wasm`}}var Zr=class{};function AM(){var t=navigator;return typeof OffscreenCanvas<"u"&&(!function(e=navigator){return(e=e.userAgent).includes("Safari")&&!e.includes("Chrome")}(t)||!!((t=t.userAgent.match(/Version\/([\d]+).*Safari/))&&t.length>=1&&Number(t[1])>=17))}async function xy(t){if(typeof importScripts!="function"){let e=document.createElement("script");return e.src=t.toString(),e.crossOrigin="anonymous",new Promise((n,i)=>{e.addEventListener("load",()=>{n()},!1),e.addEventListener("error",r=>{i(r)},!1),document.body.appendChild(e)})}importScripts(t.toString())}function RM(t){return t.videoWidth!==void 0?[t.videoWidth,t.videoHeight]:t.naturalWidth!==void 0?[t.naturalWidth,t.naturalHeight]:t.displayWidth!==void 0?[t.displayWidth,t.displayHeight]:[t.width,t.height]}function Pe(t,e,n){t.m||console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target"),n(e=t.i.stringToNewUTF8(e)),t.i._free(e)}function yy(t,e,n){if(!t.i.canvas)throw Error("No OpenGL canvas configured.");if(n?t.i._bindTextureToStream(n):t.i._bindTextureToCanvas(),!(n=t.i.canvas.getContext("webgl2")||t.i.canvas.getContext("webgl")))throw Error("Failed to obtain WebGL context from the provided canvas. `getContext()` should only be invoked with `webgl` or `webgl2`.");t.i.gpuOriginForWebTexturesIsBottomLeft&&n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!0),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,e),t.i.gpuOriginForWebTexturesIsBottomLeft&&n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1);let[i,r]=RM(e);return!t.l||i===t.i.canvas.width&&r===t.i.canvas.height||(t.i.canvas.width=i,t.i.canvas.height=r),[i,r]}function My(t,e,n){t.m||console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target");let i=new Uint32Array(e.length);for(let r=0;r<e.length;r++)i[r]=t.i.stringToNewUTF8(e[r]);e=t.i._malloc(4*i.length),t.i.HEAPU32.set(i,e>>2),n(e);for(let r of i)t.i._free(r);t.i._free(e)}function Zi(t,e,n){t.i.simpleListeners=t.i.simpleListeners||{},t.i.simpleListeners[e]=n}function jr(t,e,n){let i=[];t.i.simpleListeners=t.i.simpleListeners||{},t.i.simpleListeners[e]=(r,s,o)=>{s?(n(i,o),i=[]):i.push(r)}}Zr.forVisionTasks=function(t){return Ol("vision",t)},Zr.forTextTasks=function(t){return Ol("text",t)},Zr.forGenAiExperimentalTasks=function(t){return Ol("genai_experimental",t)},Zr.forGenAiTasks=function(t){return Ol("genai",t)},Zr.forAudioTasks=function(t){return Ol("audio",t)},Zr.isSimdSupported=function(){return wM()};async function qC(t,e,n,i){return t=await(async(r,s,o,a,l)=>{if(s&&await xy(s),!self.ModuleFactory||o&&(await xy(o),!self.ModuleFactory))throw Error("ModuleFactory not set.");return self.Module&&l&&((s=self.Module).locateFile=l.locateFile,l.mainScriptUrlOrBlob&&(s.mainScriptUrlOrBlob=l.mainScriptUrlOrBlob)),l=await self.ModuleFactory(self.Module||l),self.ModuleFactory=self.Module=void 0,new r(l,a)})(t,n.wasmLoaderPath,n.assetLoaderPath,e,{locateFile:r=>r.endsWith(".wasm")?n.wasmBinaryPath.toString():n.assetBinaryPath&&r.endsWith(".data")?n.assetBinaryPath.toString():r}),await t.o(i),t}function Mm(t,e){let n=lt(t.baseOptions,Oh,1)||new Oh;typeof e=="string"?(Rt(n,2,Ma(e)),Rt(n,1)):e instanceof Uint8Array&&(Rt(n,1,Zm(e,!1)),Rt(n,2)),Ne(t.baseOptions,0,1,n)}function Ey(t){try{let e=t.G.length;if(e===1)throw Error(t.G[0].message);if(e>1)throw Error("Encountered multiple errors: "+t.G.map(n=>n.message).join(", "))}finally{t.G=[]}}function pe(t,e){t.B=Math.max(t.B,e)}function od(t,e){t.A=new An,Jn(t.A,"PassThroughCalculator"),Ct(t.A,"free_memory"),rt(t.A,"free_memory_unused_out"),Pt(e,"free_memory"),Qn(e,t.A)}function ma(t,e){Ct(t.A,e),rt(t.A,e+"_unused_out")}function ad(t){t.g.addBoolToStream(!0,"free_memory",t.B)}var bh=class{constructor(t){this.g=t,this.G=[],this.B=0,this.g.setAutoRenderToScreen(!1)}l(t,e=!0){if(e){let n=t.baseOptions||{};if(t.baseOptions?.modelAssetBuffer&&t.baseOptions?.modelAssetPath)throw Error("Cannot set both baseOptions.modelAssetPath and baseOptions.modelAssetBuffer");if(!(lt(this.baseOptions,Oh,1)?.g()||lt(this.baseOptions,Oh,1)?.h()||t.baseOptions?.modelAssetBuffer||t.baseOptions?.modelAssetPath))throw Error("Either baseOptions.modelAssetPath or baseOptions.modelAssetBuffer must be set");if(function(i,r){let s=lt(i.baseOptions,py,3);if(!s){var o=s=new py,a=new ly;Vl(o,4,Th,a)}"delegate"in r&&(r.delegate==="GPU"?(r=s,o=new xC,Vl(r,2,Th,o)):(r=s,o=new ly,Vl(r,4,Th,o))),Ne(i.baseOptions,0,3,s)}(this,n),n.modelAssetPath)return fetch(n.modelAssetPath.toString()).then(i=>{if(i.ok)return i.arrayBuffer();throw Error(`Failed to fetch model: ${n.modelAssetPath} (${i.status})`)}).then(i=>{try{this.g.i.FS_unlink("/model.dat")}catch{}this.g.i.FS_createDataFile("/","model.dat",new Uint8Array(i),!0,!1,!1),Mm(this,"/model.dat"),this.m(),this.I()});if(n.modelAssetBuffer instanceof Uint8Array)Mm(this,n.modelAssetBuffer);else if(n.modelAssetBuffer)return async function(i){let r=[];for(var s=0;;){let{done:o,value:a}=await i.read();if(o)break;r.push(a),s+=a.length}if(r.length===0)return new Uint8Array(0);if(r.length===1)return r[0];i=new Uint8Array(s),s=0;for(let o of r)i.set(o,s),s+=o.length;return i}(n.modelAssetBuffer).then(i=>{Mm(this,i),this.m(),this.I()})}return this.m(),this.I(),Promise.resolve()}I(){}da(){let t;if(this.g.da(e=>{t=yC(e)}),!t)throw Error("Failed to retrieve CalculatorGraphConfig");return t}setGraph(t,e){this.g.attachErrorListener((n,i)=>{this.G.push(Error(i))}),this.g.La(),this.g.setGraph(t,e),this.A=void 0,Ey(this)}finishProcessing(){this.g.finishProcessing(),Ey(this)}close(){this.A=void 0,this.g.closeGraph()}};function wn(t,e){if(!t)throw Error(`Unable to obtain required WebGL resource: ${e}`);return t}bh.prototype.close=bh.prototype.close,function(t,e){t=t.split(".");var n,i=js;for((t[0]in i)||i.execScript===void 0||i.execScript("var "+t[0]);t.length&&(n=t.shift());)t.length||e===void 0?i=i[n]&&i[n]!==Object.prototype[n]?i[n]:i[n]={}:i[n]=e}("TaskRunner",bh);var Fm=class{constructor(e,n,i,r){this.g=e,this.h=n,this.m=i,this.l=r}bind(){this.g.bindVertexArray(this.h)}close(){this.g.deleteVertexArray(this.h),this.g.deleteBuffer(this.m),this.g.deleteBuffer(this.l)}};function Sy(t,e,n){let i=t.g;if(n=wn(i.createShader(n),"Failed to create WebGL shader"),i.shaderSource(n,e),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw Error(`Could not compile WebGL shader: ${i.getShaderInfoLog(n)}`);return i.attachShader(t.h,n),n}function Ty(t,e){let n=t.g,i=wn(n.createVertexArray(),"Failed to create vertex array");n.bindVertexArray(i);let r=wn(n.createBuffer(),"Failed to create buffer");n.bindBuffer(n.ARRAY_BUFFER,r),n.enableVertexAttribArray(t.O),n.vertexAttribPointer(t.O,2,n.FLOAT,!1,0,0),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),n.STATIC_DRAW);let s=wn(n.createBuffer(),"Failed to create buffer");return n.bindBuffer(n.ARRAY_BUFFER,s),n.enableVertexAttribArray(t.I),n.vertexAttribPointer(t.I,2,n.FLOAT,!1,0,0),n.bufferData(n.ARRAY_BUFFER,new Float32Array(e?[0,1,0,0,1,0,1,1]:[0,0,0,1,1,1,1,0]),n.STATIC_DRAW),n.bindBuffer(n.ARRAY_BUFFER,null),n.bindVertexArray(null),new Fm(n,i,r,s)}function Bg(t,e){if(t.g){if(e!==t.g)throw Error("Cannot change GL context once initialized")}else t.g=e}function ec(t,e,n,i){return Bg(t,e),t.h||(t.m(),t.C()),n?(t.s||(t.s=Ty(t,!0)),n=t.s):(t.v||(t.v=Ty(t,!1)),n=t.v),e.useProgram(t.h),n.bind(),t.l(),t=i(),n.g.bindVertexArray(null),t}function is(t,e,n){return Bg(t,e),t=wn(e.createTexture(),"Failed to create texture"),e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,n??e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,n??e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),t}function ld(t,e,n){Bg(t,e),t.A||(t.A=wn(e.createFramebuffer(),"Failed to create framebuffe.")),e.bindFramebuffer(e.FRAMEBUFFER,t.A),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0)}function kg(t){t.g?.bindFramebuffer(t.g.FRAMEBUFFER,null)}var Aa=class{G(){return`
  precision mediump float;
  varying vec2 vTex;
  uniform sampler2D inputTexture;
  void main() {
    gl_FragColor = texture2D(inputTexture, vTex);
  }
 `}m(){let t=this.g;if(this.h=wn(t.createProgram(),"Failed to create WebGL program"),this.aa=Sy(this,`
  attribute vec2 aVertex;
  attribute vec2 aTex;
  varying vec2 vTex;
  void main(void) {
    gl_Position = vec4(aVertex, 0.0, 1.0);
    vTex = aTex;
  }`,t.VERTEX_SHADER),this.Z=Sy(this,this.G(),t.FRAGMENT_SHADER),t.linkProgram(this.h),!t.getProgramParameter(this.h,t.LINK_STATUS))throw Error(`Error during program linking: ${t.getProgramInfoLog(this.h)}`);this.O=t.getAttribLocation(this.h,"aVertex"),this.I=t.getAttribLocation(this.h,"aTex")}C(){}l(){}close(){if(this.h){let t=this.g;t.deleteProgram(this.h),t.deleteShader(this.aa),t.deleteShader(this.Z)}this.A&&this.g.deleteFramebuffer(this.A),this.v&&this.v.close(),this.s&&this.s.close()}},YC=class extends Aa{G(){return`
  precision mediump float;
  uniform sampler2D backgroundTexture;
  uniform sampler2D maskTexture;
  uniform sampler2D colorMappingTexture;
  varying vec2 vTex;
  void main() {
    vec4 backgroundColor = texture2D(backgroundTexture, vTex);
    float category = texture2D(maskTexture, vTex).r;
    vec4 categoryColor = texture2D(colorMappingTexture, vec2(category, 0.0));
    gl_FragColor = mix(backgroundColor, categoryColor, categoryColor.a);
  }
 `}C(){let t=this.g;t.activeTexture(t.TEXTURE1),this.B=is(this,t,t.LINEAR),t.activeTexture(t.TEXTURE2),this.j=is(this,t,t.NEAREST)}m(){super.m();let t=this.g;this.K=wn(t.getUniformLocation(this.h,"backgroundTexture"),"Uniform location"),this.T=wn(t.getUniformLocation(this.h,"colorMappingTexture"),"Uniform location"),this.J=wn(t.getUniformLocation(this.h,"maskTexture"),"Uniform location")}l(){super.l();let t=this.g;t.uniform1i(this.J,0),t.uniform1i(this.K,1),t.uniform1i(this.T,2)}close(){this.B&&this.g.deleteTexture(this.B),this.j&&this.g.deleteTexture(this.j),super.close()}},$C=class extends Aa{G(){return`
  precision mediump float;
  uniform sampler2D maskTexture;
  uniform sampler2D defaultTexture;
  uniform sampler2D overlayTexture;
  varying vec2 vTex;
  void main() {
    float confidence = texture2D(maskTexture, vTex).r;
    vec4 defaultColor = texture2D(defaultTexture, vTex);
    vec4 overlayColor = texture2D(overlayTexture, vTex);
    // Apply the alpha from the overlay and merge in the default color
    overlayColor = mix(defaultColor, overlayColor, overlayColor.a);
    gl_FragColor = mix(defaultColor, overlayColor, confidence);
  }
 `}C(){let t=this.g;t.activeTexture(t.TEXTURE1),this.j=is(this,t),t.activeTexture(t.TEXTURE2),this.B=is(this,t)}m(){super.m();let t=this.g;this.J=wn(t.getUniformLocation(this.h,"defaultTexture"),"Uniform location"),this.K=wn(t.getUniformLocation(this.h,"overlayTexture"),"Uniform location"),this.H=wn(t.getUniformLocation(this.h,"maskTexture"),"Uniform location")}l(){super.l();let t=this.g;t.uniform1i(this.H,0),t.uniform1i(this.J,1),t.uniform1i(this.K,2)}close(){this.j&&this.g.deleteTexture(this.j),this.B&&this.g.deleteTexture(this.B),super.close()}};function Tr(t,e){switch(e){case 0:return t.g.find(n=>n instanceof Uint8Array);case 1:return t.g.find(n=>n instanceof Float32Array);case 2:return t.g.find(n=>typeof WebGLTexture<"u"&&n instanceof WebGLTexture);default:throw Error(`Type is not supported: ${e}`)}}function Bm(t){var e=Tr(t,1);if(!e){if(e=Tr(t,0))e=new Float32Array(e).map(i=>i/255);else{e=new Float32Array(t.width*t.height);let i=ga(t);var n=Hg(t);if(ld(n,i,CM(t)),"iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform)||navigator.userAgent.includes("Mac")&&"document"in self&&"ontouchend"in self.document){n=new Float32Array(t.width*t.height*4),i.readPixels(0,0,t.width,t.height,i.RGBA,i.FLOAT,n);for(let r=0,s=0;r<e.length;++r,s+=4)e[r]=n[s]}else i.readPixels(0,0,t.width,t.height,i.RED,i.FLOAT,e)}t.g.push(e)}return e}function CM(t){let e=Tr(t,2);if(!e){let n=ga(t);e=PM(t);let i=Bm(t),r=IM(t);n.texImage2D(n.TEXTURE_2D,0,r,t.width,t.height,0,n.RED,n.FLOAT,i),km(t)}return e}function ga(t){if(!t.canvas)throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");return t.h||(t.h=wn(t.canvas.getContext("webgl2"),"You cannot use a canvas that is already bound to a different type of rendering context.")),t.h}function IM(t){if(t=ga(t),!yh)if(t.getExtension("EXT_color_buffer_float")&&t.getExtension("OES_texture_float_linear")&&t.getExtension("EXT_float_blend"))yh=t.R32F;else{if(!t.getExtension("EXT_color_buffer_half_float"))throw Error("GPU does not fully support 4-channel float32 or float16 formats");yh=t.R16F}return yh}function Hg(t){return t.l||(t.l=new Aa),t.l}function PM(t){let e=ga(t);e.viewport(0,0,t.width,t.height),e.activeTexture(e.TEXTURE0);let n=Tr(t,2);return n||(n=is(Hg(t),e,t.m?e.LINEAR:e.NEAREST),t.g.push(n),t.j=!0),e.bindTexture(e.TEXTURE_2D,n),n}function km(t){t.h.bindTexture(t.h.TEXTURE_2D,null)}var yh,nn=class{constructor(t,e,n,i,r,s,o){this.g=t,this.m=e,this.j=n,this.canvas=i,this.l=r,this.width=s,this.height=o,this.j&&--by===0&&console.error("You seem to be creating MPMask instances without invoking .close(). This leaks resources.")}Fa(){return!!Tr(this,0)}ja(){return!!Tr(this,1)}P(){return!!Tr(this,2)}ia(){return(e=Tr(t=this,0))||(e=Bm(t),e=new Uint8Array(e.map(n=>255*n)),t.g.push(e)),e;var t,e}ha(){return Bm(this)}M(){return CM(this)}clone(){let t=[];for(let e of this.g){let n;if(e instanceof Uint8Array)n=new Uint8Array(e);else if(e instanceof Float32Array)n=new Float32Array(e);else{if(!(e instanceof WebGLTexture))throw Error(`Type is not supported: ${e}`);{let i=ga(this),r=Hg(this);i.activeTexture(i.TEXTURE1),n=is(r,i,this.m?i.LINEAR:i.NEAREST),i.bindTexture(i.TEXTURE_2D,n);let s=IM(this);i.texImage2D(i.TEXTURE_2D,0,s,this.width,this.height,0,i.RED,i.FLOAT,null),i.bindTexture(i.TEXTURE_2D,null),ld(r,i,n),ec(r,i,!1,()=>{PM(this),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.drawArrays(i.TRIANGLE_FAN,0,4),km(this)}),kg(r),km(this)}}t.push(n)}return new nn(t,this.m,this.P(),this.canvas,this.l,this.width,this.height)}close(){this.j&&ga(this).deleteTexture(Tr(this,2)),by=-1}};nn.prototype.close=nn.prototype.close,nn.prototype.clone=nn.prototype.clone,nn.prototype.getAsWebGLTexture=nn.prototype.M,nn.prototype.getAsFloat32Array=nn.prototype.ha,nn.prototype.getAsUint8Array=nn.prototype.ia,nn.prototype.hasWebGLTexture=nn.prototype.P,nn.prototype.hasFloat32Array=nn.prototype.ja,nn.prototype.hasUint8Array=nn.prototype.Fa;var by=250,jC={color:"white",lineWidth:4,radius:6};function Em(t){return{...jC,fillColor:(t=t||{}).color,...t}}function Er(t,e){return t instanceof Function?t(e):t}function wy(t,e,n){return Math.max(Math.min(e,n),Math.min(Math.max(e,n),t))}function Fl(t){if(!t.l)throw Error("CPU rendering requested but CanvasRenderingContext2D not provided.");return t.l}function $l(t){if(!t.j)throw Error("GPU rendering requested but WebGL2RenderingContext not provided.");return t.j}function Ay(t,e,n){if(e.P())n(e.M());else{let i=e.ja()?e.ha():e.ia();t.m=t.m??new Aa;let r=$l(t);n((t=new nn([i],e.m,!1,r.canvas,t.m,e.width,e.height)).M()),t.close()}}function Ry(t,e,n,i){let r=function(a){return a.g||(a.g=new YC),a.g}(t),s=$l(t),o=Array.isArray(n)?new ImageData(new Uint8ClampedArray(n),1,1):n;ec(r,s,!0,()=>{(function(l,c,u,h){let d=l.g;if(d.activeTexture(d.TEXTURE0),d.bindTexture(d.TEXTURE_2D,c),d.activeTexture(d.TEXTURE1),d.bindTexture(d.TEXTURE_2D,l.B),d.texImage2D(d.TEXTURE_2D,0,d.RGBA,d.RGBA,d.UNSIGNED_BYTE,u),l.H&&function(f,g){if(f!==g)return!1;f=f.entries(),g=g.entries();for(let[m,p]of f){f=m;let E=p;var _=g.next();if(_.done)return!1;let[T,v]=_.value;if(_=v,f!==T||E[0]!==_[0]||E[1]!==_[1]||E[2]!==_[2]||E[3]!==_[3])return!1}return!!g.next().done}(l.H,h))d.activeTexture(d.TEXTURE2),d.bindTexture(d.TEXTURE_2D,l.j);else{l.H=h;let f=Array(1024).fill(0);h.forEach((g,_)=>{if(g.length!==4)throw Error(`Color at index ${_} is not a four-channel value.`);f[4*_]=g[0],f[4*_+1]=g[1],f[4*_+2]=g[2],f[4*_+3]=g[3]}),d.activeTexture(d.TEXTURE2),d.bindTexture(d.TEXTURE_2D,l.j),d.texImage2D(d.TEXTURE_2D,0,d.RGBA,256,1,0,d.RGBA,d.UNSIGNED_BYTE,new Uint8Array(f))}})(r,e,o,i),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),s.drawArrays(s.TRIANGLE_FAN,0,4);let a=r.g;a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,null),a.activeTexture(a.TEXTURE1),a.bindTexture(a.TEXTURE_2D,null),a.activeTexture(a.TEXTURE2),a.bindTexture(a.TEXTURE_2D,null)})}function Cy(t,e,n,i){let r=$l(t),s=function(l){return l.h||(l.h=new $C),l.h}(t),o=Array.isArray(n)?new ImageData(new Uint8ClampedArray(n),1,1):n,a=Array.isArray(i)?new ImageData(new Uint8ClampedArray(i),1,1):i;ec(s,r,!0,()=>{var l=s.g;l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,e),l.activeTexture(l.TEXTURE1),l.bindTexture(l.TEXTURE_2D,s.j),l.texImage2D(l.TEXTURE_2D,0,l.RGBA,l.RGBA,l.UNSIGNED_BYTE,o),l.activeTexture(l.TEXTURE2),l.bindTexture(l.TEXTURE_2D,s.B),l.texImage2D(l.TEXTURE_2D,0,l.RGBA,l.RGBA,l.UNSIGNED_BYTE,a),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT),r.drawArrays(r.TRIANGLE_FAN,0,4),r.bindTexture(r.TEXTURE_2D,null),(l=s.g).activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,null),l.activeTexture(l.TEXTURE1),l.bindTexture(l.TEXTURE_2D,null),l.activeTexture(l.TEXTURE2),l.bindTexture(l.TEXTURE_2D,null)})}var Dn=class{constructor(t,e){t instanceof CanvasRenderingContext2D||t instanceof OffscreenCanvasRenderingContext2D?(this.l=t,this.j=e):this.j=t}ya(t,e){if(t){var n=Fl(this);e=Em(e),n.save();var i=n.canvas,r=0;for(let s of t)n.fillStyle=Er(e.fillColor,{index:r,from:s}),n.strokeStyle=Er(e.color,{index:r,from:s}),n.lineWidth=Er(e.lineWidth,{index:r,from:s}),(t=new Path2D).arc(s.x*i.width,s.y*i.height,Er(e.radius,{index:r,from:s}),0,2*Math.PI),n.fill(t),n.stroke(t),++r;n.restore()}}xa(t,e,n){if(t&&e){var i=Fl(this);n=Em(n),i.save();var r=i.canvas,s=0;for(let o of e){i.beginPath(),e=t[o.start];let a=t[o.end];e&&a&&(i.strokeStyle=Er(n.color,{index:s,from:e,to:a}),i.lineWidth=Er(n.lineWidth,{index:s,from:e,to:a}),i.moveTo(e.x*r.width,e.y*r.height),i.lineTo(a.x*r.width,a.y*r.height)),++s,i.stroke()}i.restore()}}ua(t,e){let n=Fl(this);e=Em(e),n.save(),n.beginPath(),n.lineWidth=Er(e.lineWidth,{}),n.strokeStyle=Er(e.color,{}),n.fillStyle=Er(e.fillColor,{}),n.moveTo(t.originX,t.originY),n.lineTo(t.originX+t.width,t.originY),n.lineTo(t.originX+t.width,t.originY+t.height),n.lineTo(t.originX,t.originY+t.height),n.lineTo(t.originX,t.originY),n.stroke(),n.fill(),n.restore()}va(t,e,n=[0,0,0,255]){this.l?function(i,r,s,o){let a=$l(i);Ay(i,r,l=>{Ry(i,l,s,o),(l=Fl(i)).drawImage(a.canvas,0,0,l.canvas.width,l.canvas.height)})}(this,t,n,e):Ry(this,t.M(),n,e)}wa(t,e,n){this.l?function(i,r,s,o){let a=$l(i);Ay(i,r,l=>{Cy(i,l,s,o),(l=Fl(i)).drawImage(a.canvas,0,0,l.canvas.width,l.canvas.height)})}(this,t,e,n):Cy(this,t.M(),e,n)}close(){this.g?.close(),this.g=void 0,this.h?.close(),this.h=void 0,this.m?.close(),this.m=void 0}};function Qi(t,e){switch(e){case 0:return t.g.find(n=>n instanceof ImageData);case 1:return t.g.find(n=>typeof ImageBitmap<"u"&&n instanceof ImageBitmap);case 2:return t.g.find(n=>typeof WebGLTexture<"u"&&n instanceof WebGLTexture);default:throw Error(`Type is not supported: ${e}`)}}function LM(t){var e=Qi(t,0);if(!e){e=_a(t);let n=cd(t),i=new Uint8Array(t.width*t.height*4);ld(n,e,wh(t)),e.readPixels(0,0,t.width,t.height,e.RGBA,e.UNSIGNED_BYTE,i),kg(n),e=new ImageData(new Uint8ClampedArray(i.buffer),t.width,t.height),t.g.push(e)}return e}function wh(t){let e=Qi(t,2);if(!e){let n=_a(t);e=Ah(t);let i=Qi(t,1)||LM(t);n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,i),kl(t)}return e}function _a(t){if(!t.canvas)throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");return t.h||(t.h=wn(t.canvas.getContext("webgl2"),"You cannot use a canvas that is already bound to a different type of rendering context.")),t.h}function cd(t){return t.l||(t.l=new Aa),t.l}function Ah(t){let e=_a(t);e.viewport(0,0,t.width,t.height),e.activeTexture(e.TEXTURE0);let n=Qi(t,2);return n||(n=is(cd(t),e),t.g.push(n),t.m=!0),e.bindTexture(e.TEXTURE_2D,n),n}function kl(t){t.h.bindTexture(t.h.TEXTURE_2D,null)}function Iy(t){let e=_a(t);return ec(cd(t),e,!0,()=>function(n,i){let r=n.canvas;if(r.width===n.width&&r.height===n.height)return i();let s=r.width,o=r.height;return r.width=n.width,r.height=n.height,n=i(),r.width=s,r.height=o,n}(t,()=>{if(e.bindFramebuffer(e.FRAMEBUFFER,null),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLE_FAN,0,4),!(t.canvas instanceof OffscreenCanvas))throw Error("Conversion to ImageBitmap requires that the MediaPipe Tasks is initialized with an OffscreenCanvas");return t.canvas.transferToImageBitmap()}))}Dn.prototype.close=Dn.prototype.close,Dn.prototype.drawConfidenceMask=Dn.prototype.wa,Dn.prototype.drawCategoryMask=Dn.prototype.va,Dn.prototype.drawBoundingBox=Dn.prototype.ua,Dn.prototype.drawConnectors=Dn.prototype.xa,Dn.prototype.drawLandmarks=Dn.prototype.ya,Dn.lerp=function(t,e,n,i,r){return wy(i*(1-(t-e)/(n-e))+r*(1-(n-t)/(n-e)),i,r)},Dn.clamp=wy;var cn=class{constructor(t,e,n,i,r,s,o){this.g=t,this.j=e,this.m=n,this.canvas=i,this.l=r,this.width=s,this.height=o,(this.j||this.m)&&--Py===0&&console.error("You seem to be creating MPImage instances without invoking .close(). This leaks resources.")}Ea(){return!!Qi(this,0)}ka(){return!!Qi(this,1)}P(){return!!Qi(this,2)}Ca(){return LM(this)}Ba(){var t=Qi(this,1);return t||(wh(this),Ah(this),t=Iy(this),kl(this),this.g.push(t),this.j=!0),t}M(){return wh(this)}clone(){let t=[];for(let e of this.g){let n;if(e instanceof ImageData)n=new ImageData(e.data,this.width,this.height);else if(e instanceof WebGLTexture){let i=_a(this),r=cd(this);i.activeTexture(i.TEXTURE1),n=is(r,i),i.bindTexture(i.TEXTURE_2D,n),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,this.width,this.height,0,i.RGBA,i.UNSIGNED_BYTE,null),i.bindTexture(i.TEXTURE_2D,null),ld(r,i,n),ec(r,i,!1,()=>{Ah(this),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.drawArrays(i.TRIANGLE_FAN,0,4),kl(this)}),kg(r),kl(this)}else{if(!(e instanceof ImageBitmap))throw Error(`Type is not supported: ${e}`);wh(this),Ah(this),n=Iy(this),kl(this)}t.push(n)}return new cn(t,this.ka(),this.P(),this.canvas,this.l,this.width,this.height)}close(){this.j&&Qi(this,1).close(),this.m&&_a(this).deleteTexture(Qi(this,2)),Py=-1}};cn.prototype.close=cn.prototype.close,cn.prototype.clone=cn.prototype.clone,cn.prototype.getAsWebGLTexture=cn.prototype.M,cn.prototype.getAsImageBitmap=cn.prototype.Ba,cn.prototype.getAsImageData=cn.prototype.Ca,cn.prototype.hasWebGLTexture=cn.prototype.P,cn.prototype.hasImageBitmap=cn.prototype.ka,cn.prototype.hasImageData=cn.prototype.Ea;var Py=250;function Ni(...t){return t.map(([e,n])=>({start:e,end:n}))}var ZC=function(t){return class extends t{La(){this.i._registerModelResourcesGraphService()}}}((Ly=class{constructor(t,e){this.l=!0,this.i=t,this.g=null,this.h=0,this.m=typeof this.i._addIntToInputStream=="function",e!==void 0?this.i.canvas=e:AM()?this.i.canvas=new OffscreenCanvas(1,1):(console.warn("OffscreenCanvas not supported and GraphRunner constructor glCanvas parameter is undefined. Creating backup canvas."),this.i.canvas=document.createElement("canvas"))}async initializeGraph(t){let e=await(await fetch(t)).arrayBuffer();t=!(t.endsWith(".pbtxt")||t.endsWith(".textproto")),this.setGraph(new Uint8Array(e),t)}setGraphFromString(t){this.setGraph(new TextEncoder().encode(t),!1)}setGraph(t,e){let n=t.length,i=this.i._malloc(n);this.i.HEAPU8.set(t,i),e?this.i._changeBinaryGraph(n,i):this.i._changeTextGraph(n,i),this.i._free(i)}configureAudio(t,e,n,i,r){this.i._configureAudio||console.warn('Attempting to use configureAudio without support for input audio. Is build dep ":gl_graph_runner_audio" missing?'),Pe(this,i||"input_audio",s=>{Pe(this,r=r||"audio_header",o=>{this.i._configureAudio(s,o,t,e??0,n)})})}setAutoResizeCanvas(t){this.l=t}setAutoRenderToScreen(t){this.i._setAutoRenderToScreen(t)}setGpuBufferVerticalFlip(t){this.i.gpuOriginForWebTexturesIsBottomLeft=t}da(t){Zi(this,"__graph_config__",e=>{t(e)}),Pe(this,"__graph_config__",e=>{this.i._getGraphConfig(e,void 0)}),delete this.i.simpleListeners.__graph_config__}attachErrorListener(t){this.i.errorListener=t}attachEmptyPacketListener(t,e){this.i.emptyPacketListeners=this.i.emptyPacketListeners||{},this.i.emptyPacketListeners[t]=e}addAudioToStream(t,e,n){this.addAudioToStreamWithShape(t,0,0,e,n)}addAudioToStreamWithShape(t,e,n,i,r){let s=4*t.length;this.h!==s&&(this.g&&this.i._free(this.g),this.g=this.i._malloc(s),this.h=s),this.i.HEAPF32.set(t,this.g/4),Pe(this,i,o=>{this.i._addAudioToInputStream(this.g,e,n,o,r)})}addGpuBufferToStream(t,e,n){Pe(this,e,i=>{let[r,s]=yy(this,t,i);this.i._addBoundTextureToStream(i,r,s,n)})}addBoolToStream(t,e,n){Pe(this,e,i=>{this.i._addBoolToInputStream(t,i,n)})}addDoubleToStream(t,e,n){Pe(this,e,i=>{this.i._addDoubleToInputStream(t,i,n)})}addFloatToStream(t,e,n){Pe(this,e,i=>{this.i._addFloatToInputStream(t,i,n)})}addIntToStream(t,e,n){Pe(this,e,i=>{this.i._addIntToInputStream(t,i,n)})}addUintToStream(t,e,n){Pe(this,e,i=>{this.i._addUintToInputStream(t,i,n)})}addStringToStream(t,e,n){Pe(this,e,i=>{Pe(this,t,r=>{this.i._addStringToInputStream(r,i,n)})})}addStringRecordToStream(t,e,n){Pe(this,e,i=>{My(this,Object.keys(t),r=>{My(this,Object.values(t),s=>{this.i._addFlatHashMapToInputStream(r,s,Object.keys(t).length,i,n)})})})}addProtoToStream(t,e,n,i){Pe(this,n,r=>{Pe(this,e,s=>{let o=this.i._malloc(t.length);this.i.HEAPU8.set(t,o),this.i._addProtoToInputStream(o,t.length,s,r,i),this.i._free(o)})})}addEmptyPacketToStream(t,e){Pe(this,t,n=>{this.i._addEmptyPacketToInputStream(n,e)})}addBoolVectorToStream(t,e,n){Pe(this,e,i=>{let r=this.i._allocateBoolVector(t.length);if(!r)throw Error("Unable to allocate new bool vector on heap.");for(let s of t)this.i._addBoolVectorEntry(r,s);this.i._addBoolVectorToInputStream(r,i,n)})}addDoubleVectorToStream(t,e,n){Pe(this,e,i=>{let r=this.i._allocateDoubleVector(t.length);if(!r)throw Error("Unable to allocate new double vector on heap.");for(let s of t)this.i._addDoubleVectorEntry(r,s);this.i._addDoubleVectorToInputStream(r,i,n)})}addFloatVectorToStream(t,e,n){Pe(this,e,i=>{let r=this.i._allocateFloatVector(t.length);if(!r)throw Error("Unable to allocate new float vector on heap.");for(let s of t)this.i._addFloatVectorEntry(r,s);this.i._addFloatVectorToInputStream(r,i,n)})}addIntVectorToStream(t,e,n){Pe(this,e,i=>{let r=this.i._allocateIntVector(t.length);if(!r)throw Error("Unable to allocate new int vector on heap.");for(let s of t)this.i._addIntVectorEntry(r,s);this.i._addIntVectorToInputStream(r,i,n)})}addUintVectorToStream(t,e,n){Pe(this,e,i=>{let r=this.i._allocateUintVector(t.length);if(!r)throw Error("Unable to allocate new unsigned int vector on heap.");for(let s of t)this.i._addUintVectorEntry(r,s);this.i._addUintVectorToInputStream(r,i,n)})}addStringVectorToStream(t,e,n){Pe(this,e,i=>{let r=this.i._allocateStringVector(t.length);if(!r)throw Error("Unable to allocate new string vector on heap.");for(let s of t)Pe(this,s,o=>{this.i._addStringVectorEntry(r,o)});this.i._addStringVectorToInputStream(r,i,n)})}addBoolToInputSidePacket(t,e){Pe(this,e,n=>{this.i._addBoolToInputSidePacket(t,n)})}addDoubleToInputSidePacket(t,e){Pe(this,e,n=>{this.i._addDoubleToInputSidePacket(t,n)})}addFloatToInputSidePacket(t,e){Pe(this,e,n=>{this.i._addFloatToInputSidePacket(t,n)})}addIntToInputSidePacket(t,e){Pe(this,e,n=>{this.i._addIntToInputSidePacket(t,n)})}addUintToInputSidePacket(t,e){Pe(this,e,n=>{this.i._addUintToInputSidePacket(t,n)})}addStringToInputSidePacket(t,e){Pe(this,e,n=>{Pe(this,t,i=>{this.i._addStringToInputSidePacket(i,n)})})}addProtoToInputSidePacket(t,e,n){Pe(this,n,i=>{Pe(this,e,r=>{let s=this.i._malloc(t.length);this.i.HEAPU8.set(t,s),this.i._addProtoToInputSidePacket(s,t.length,r,i),this.i._free(s)})})}addBoolVectorToInputSidePacket(t,e){Pe(this,e,n=>{let i=this.i._allocateBoolVector(t.length);if(!i)throw Error("Unable to allocate new bool vector on heap.");for(let r of t)this.i._addBoolVectorEntry(i,r);this.i._addBoolVectorToInputSidePacket(i,n)})}addDoubleVectorToInputSidePacket(t,e){Pe(this,e,n=>{let i=this.i._allocateDoubleVector(t.length);if(!i)throw Error("Unable to allocate new double vector on heap.");for(let r of t)this.i._addDoubleVectorEntry(i,r);this.i._addDoubleVectorToInputSidePacket(i,n)})}addFloatVectorToInputSidePacket(t,e){Pe(this,e,n=>{let i=this.i._allocateFloatVector(t.length);if(!i)throw Error("Unable to allocate new float vector on heap.");for(let r of t)this.i._addFloatVectorEntry(i,r);this.i._addFloatVectorToInputSidePacket(i,n)})}addIntVectorToInputSidePacket(t,e){Pe(this,e,n=>{let i=this.i._allocateIntVector(t.length);if(!i)throw Error("Unable to allocate new int vector on heap.");for(let r of t)this.i._addIntVectorEntry(i,r);this.i._addIntVectorToInputSidePacket(i,n)})}addUintVectorToInputSidePacket(t,e){Pe(this,e,n=>{let i=this.i._allocateUintVector(t.length);if(!i)throw Error("Unable to allocate new unsigned int vector on heap.");for(let r of t)this.i._addUintVectorEntry(i,r);this.i._addUintVectorToInputSidePacket(i,n)})}addStringVectorToInputSidePacket(t,e){Pe(this,e,n=>{let i=this.i._allocateStringVector(t.length);if(!i)throw Error("Unable to allocate new string vector on heap.");for(let r of t)Pe(this,r,s=>{this.i._addStringVectorEntry(i,s)});this.i._addStringVectorToInputSidePacket(i,n)})}attachBoolListener(t,e){Zi(this,t,e),Pe(this,t,n=>{this.i._attachBoolListener(n)})}attachBoolVectorListener(t,e){jr(this,t,e),Pe(this,t,n=>{this.i._attachBoolVectorListener(n)})}attachIntListener(t,e){Zi(this,t,e),Pe(this,t,n=>{this.i._attachIntListener(n)})}attachIntVectorListener(t,e){jr(this,t,e),Pe(this,t,n=>{this.i._attachIntVectorListener(n)})}attachUintListener(t,e){Zi(this,t,e),Pe(this,t,n=>{this.i._attachUintListener(n)})}attachUintVectorListener(t,e){jr(this,t,e),Pe(this,t,n=>{this.i._attachUintVectorListener(n)})}attachDoubleListener(t,e){Zi(this,t,e),Pe(this,t,n=>{this.i._attachDoubleListener(n)})}attachDoubleVectorListener(t,e){jr(this,t,e),Pe(this,t,n=>{this.i._attachDoubleVectorListener(n)})}attachFloatListener(t,e){Zi(this,t,e),Pe(this,t,n=>{this.i._attachFloatListener(n)})}attachFloatVectorListener(t,e){jr(this,t,e),Pe(this,t,n=>{this.i._attachFloatVectorListener(n)})}attachStringListener(t,e){Zi(this,t,e),Pe(this,t,n=>{this.i._attachStringListener(n)})}attachStringVectorListener(t,e){jr(this,t,e),Pe(this,t,n=>{this.i._attachStringVectorListener(n)})}attachProtoListener(t,e,n){Zi(this,t,e),Pe(this,t,i=>{this.i._attachProtoListener(i,n||!1)})}attachProtoVectorListener(t,e,n){jr(this,t,e),Pe(this,t,i=>{this.i._attachProtoVectorListener(i,n||!1)})}attachAudioListener(t,e,n){this.i._attachAudioListener||console.warn('Attempting to use attachAudioListener without support for output audio. Is build dep ":gl_graph_runner_audio_out" missing?'),Zi(this,t,(i,r)=>{i=new Float32Array(i.buffer,i.byteOffset,i.length/4),e(i,r)}),Pe(this,t,i=>{this.i._attachAudioListener(i,n||!1)})}finishProcessing(){this.i._waitUntilIdle()}closeGraph(){this.i._closeGraph(),this.i.simpleListeners=void 0,this.i.emptyPacketListeners=void 0}},class extends Ly{get ea(){return this.i}qa(t,e,n){Pe(this,e,i=>{let[r,s]=yy(this,t,i);this.ea._addBoundTextureAsImageToStream(i,r,s,n)})}U(t,e){Zi(this,t,e),Pe(this,t,n=>{this.ea._attachImageListener(n)})}ca(t,e){jr(this,t,e),Pe(this,t,n=>{this.ea._attachImageVectorListener(n)})}})),Ly,_i=class extends ZC{};async function it(t,e,n){return async function(i,r,s,o){return qC(i,r,s,o)}(t,n.canvas??(AM()?void 0:document.createElement("canvas")),e,n)}function UM(t,e,n,i){if(t.T){let s=new nM;if(n?.regionOfInterest){if(!t.pa)throw Error("This task doesn't support region-of-interest.");var r=n.regionOfInterest;if(r.left>=r.right||r.top>=r.bottom)throw Error("Expected RectF with left < right and top < bottom.");if(r.left<0||r.top<0||r.right>1||r.bottom>1)throw Error("Expected RectF values to be in [0,1].");Ce(s,1,(r.left+r.right)/2),Ce(s,2,(r.top+r.bottom)/2),Ce(s,4,r.right-r.left),Ce(s,3,r.bottom-r.top)}else Ce(s,1,.5),Ce(s,2,.5),Ce(s,4,1),Ce(s,3,1);if(n?.rotationDegrees){if(n?.rotationDegrees%90!=0)throw Error("Expected rotation to be a multiple of 90\xB0.");if(Ce(s,5,-Math.PI*n.rotationDegrees/180),n?.rotationDegrees%180!=0){let[o,a]=RM(e);n=Xt(s,3)*a/o,r=Xt(s,4)*o/a,Ce(s,4,n),Ce(s,3,r)}}t.g.addProtoToStream(s.g(),"mediapipe.NormalizedRect",t.T,i)}t.g.qa(e,t.aa,i??performance.now()),t.finishProcessing()}function vi(t,e,n){if(t.baseOptions?.g())throw Error("Task is not initialized with image mode. 'runningMode' must be set to 'IMAGE'.");UM(t,e,n,t.B+1)}function tr(t,e,n,i){if(!t.baseOptions?.g())throw Error("Task is not initialized with video mode. 'runningMode' must be set to 'VIDEO'.");UM(t,e,n,i)}function va(t,e,n,i){var r=e.data;let s=e.width,o=s*(e=e.height);if((r instanceof Uint8Array||r instanceof Float32Array)&&r.length!==o)throw Error("Unsupported channel count: "+r.length/o);return t=new nn([r],n,!1,t.g.i.canvas,t.O,s,e),i?t.clone():t}var Bn=class extends bh{constructor(t,e,n,i){super(t),this.g=t,this.aa=e,this.T=n,this.pa=i,this.O=new Aa}l(t,e=!0){if("runningMode"in t&&ql(this.baseOptions,2,!!t.runningMode&&t.runningMode!=="IMAGE"),t.canvas!==void 0&&this.g.i.canvas!==t.canvas)throw Error("You must create a new task to reset the canvas.");return super.l(t,e)}close(){this.O.close(),super.close()}};Bn.prototype.close=Bn.prototype.close;var ci=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect_in",!1),this.j={detections:[]},Ne(t=this.h=new rd,0,1,e=new Ot),Ce(this.h,2,.5),Ce(this.h,3,.3)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return"minDetectionConfidence"in t&&Ce(this.h,2,t.minDetectionConfidence??.5),"minSuppressionThreshold"in t&&Ce(this.h,3,t.minSuppressionThreshold??.3),this.l(t)}D(t,e){return this.j={detections:[]},vi(this,t,e),this.j}F(t,e,n){return this.j={detections:[]},tr(this,t,n,e),this.j}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect_in"),ft(t,"detections");let e=new Zn;Pi(e,LC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.face_detector.FaceDetectorGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect_in"),rt(n,"DETECTIONS:detections"),n.o(e),Qn(t,n),this.g.attachProtoVectorListener("detections",(i,r)=>{for(let s of i)i=Q1(s),this.j.detections.push(bM(i));pe(this,r)}),this.g.attachEmptyPacketListener("detections",i=>{pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};ci.prototype.detectForVideo=ci.prototype.F,ci.prototype.detect=ci.prototype.D,ci.prototype.setOptions=ci.prototype.o,ci.createFromModelPath=async function(t,e){return it(ci,t,{baseOptions:{modelAssetPath:e}})},ci.createFromModelBuffer=function(t,e){return it(ci,t,{baseOptions:{modelAssetBuffer:e}})},ci.createFromOptions=function(t,e){return it(ci,t,e)};var Vg=Ni([61,146],[146,91],[91,181],[181,84],[84,17],[17,314],[314,405],[405,321],[321,375],[375,291],[61,185],[185,40],[40,39],[39,37],[37,0],[0,267],[267,269],[269,270],[270,409],[409,291],[78,95],[95,88],[88,178],[178,87],[87,14],[14,317],[317,402],[402,318],[318,324],[324,308],[78,191],[191,80],[80,81],[81,82],[82,13],[13,312],[312,311],[311,310],[310,415],[415,308]),zg=Ni([263,249],[249,390],[390,373],[373,374],[374,380],[380,381],[381,382],[382,362],[263,466],[466,388],[388,387],[387,386],[386,385],[385,384],[384,398],[398,362]),Gg=Ni([276,283],[283,282],[282,295],[295,285],[300,293],[293,334],[334,296],[296,336]),NM=Ni([474,475],[475,476],[476,477],[477,474]),Wg=Ni([33,7],[7,163],[163,144],[144,145],[145,153],[153,154],[154,155],[155,133],[33,246],[246,161],[161,160],[160,159],[159,158],[158,157],[157,173],[173,133]),Xg=Ni([46,53],[53,52],[52,65],[65,55],[70,63],[63,105],[105,66],[66,107]),DM=Ni([469,470],[470,471],[471,472],[472,469]),qg=Ni([10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],[356,454],[454,323],[323,361],[361,288],[288,397],[397,365],[365,379],[379,378],[378,400],[400,377],[377,152],[152,148],[148,176],[176,149],[149,150],[150,136],[136,172],[172,58],[58,132],[132,93],[93,234],[234,127],[127,162],[162,21],[21,54],[54,103],[103,67],[67,109],[109,10]),OM=[...Vg,...zg,...Gg,...Wg,...Xg,...qg],FM=Ni([127,34],[34,139],[139,127],[11,0],[0,37],[37,11],[232,231],[231,120],[120,232],[72,37],[37,39],[39,72],[128,121],[121,47],[47,128],[232,121],[121,128],[128,232],[104,69],[69,67],[67,104],[175,171],[171,148],[148,175],[118,50],[50,101],[101,118],[73,39],[39,40],[40,73],[9,151],[151,108],[108,9],[48,115],[115,131],[131,48],[194,204],[204,211],[211,194],[74,40],[40,185],[185,74],[80,42],[42,183],[183,80],[40,92],[92,186],[186,40],[230,229],[229,118],[118,230],[202,212],[212,214],[214,202],[83,18],[18,17],[17,83],[76,61],[61,146],[146,76],[160,29],[29,30],[30,160],[56,157],[157,173],[173,56],[106,204],[204,194],[194,106],[135,214],[214,192],[192,135],[203,165],[165,98],[98,203],[21,71],[71,68],[68,21],[51,45],[45,4],[4,51],[144,24],[24,23],[23,144],[77,146],[146,91],[91,77],[205,50],[50,187],[187,205],[201,200],[200,18],[18,201],[91,106],[106,182],[182,91],[90,91],[91,181],[181,90],[85,84],[84,17],[17,85],[206,203],[203,36],[36,206],[148,171],[171,140],[140,148],[92,40],[40,39],[39,92],[193,189],[189,244],[244,193],[159,158],[158,28],[28,159],[247,246],[246,161],[161,247],[236,3],[3,196],[196,236],[54,68],[68,104],[104,54],[193,168],[168,8],[8,193],[117,228],[228,31],[31,117],[189,193],[193,55],[55,189],[98,97],[97,99],[99,98],[126,47],[47,100],[100,126],[166,79],[79,218],[218,166],[155,154],[154,26],[26,155],[209,49],[49,131],[131,209],[135,136],[136,150],[150,135],[47,126],[126,217],[217,47],[223,52],[52,53],[53,223],[45,51],[51,134],[134,45],[211,170],[170,140],[140,211],[67,69],[69,108],[108,67],[43,106],[106,91],[91,43],[230,119],[119,120],[120,230],[226,130],[130,247],[247,226],[63,53],[53,52],[52,63],[238,20],[20,242],[242,238],[46,70],[70,156],[156,46],[78,62],[62,96],[96,78],[46,53],[53,63],[63,46],[143,34],[34,227],[227,143],[123,117],[117,111],[111,123],[44,125],[125,19],[19,44],[236,134],[134,51],[51,236],[216,206],[206,205],[205,216],[154,153],[153,22],[22,154],[39,37],[37,167],[167,39],[200,201],[201,208],[208,200],[36,142],[142,100],[100,36],[57,212],[212,202],[202,57],[20,60],[60,99],[99,20],[28,158],[158,157],[157,28],[35,226],[226,113],[113,35],[160,159],[159,27],[27,160],[204,202],[202,210],[210,204],[113,225],[225,46],[46,113],[43,202],[202,204],[204,43],[62,76],[76,77],[77,62],[137,123],[123,116],[116,137],[41,38],[38,72],[72,41],[203,129],[129,142],[142,203],[64,98],[98,240],[240,64],[49,102],[102,64],[64,49],[41,73],[73,74],[74,41],[212,216],[216,207],[207,212],[42,74],[74,184],[184,42],[169,170],[170,211],[211,169],[170,149],[149,176],[176,170],[105,66],[66,69],[69,105],[122,6],[6,168],[168,122],[123,147],[147,187],[187,123],[96,77],[77,90],[90,96],[65,55],[55,107],[107,65],[89,90],[90,180],[180,89],[101,100],[100,120],[120,101],[63,105],[105,104],[104,63],[93,137],[137,227],[227,93],[15,86],[86,85],[85,15],[129,102],[102,49],[49,129],[14,87],[87,86],[86,14],[55,8],[8,9],[9,55],[100,47],[47,121],[121,100],[145,23],[23,22],[22,145],[88,89],[89,179],[179,88],[6,122],[122,196],[196,6],[88,95],[95,96],[96,88],[138,172],[172,136],[136,138],[215,58],[58,172],[172,215],[115,48],[48,219],[219,115],[42,80],[80,81],[81,42],[195,3],[3,51],[51,195],[43,146],[146,61],[61,43],[171,175],[175,199],[199,171],[81,82],[82,38],[38,81],[53,46],[46,225],[225,53],[144,163],[163,110],[110,144],[52,65],[65,66],[66,52],[229,228],[228,117],[117,229],[34,127],[127,234],[234,34],[107,108],[108,69],[69,107],[109,108],[108,151],[151,109],[48,64],[64,235],[235,48],[62,78],[78,191],[191,62],[129,209],[209,126],[126,129],[111,35],[35,143],[143,111],[117,123],[123,50],[50,117],[222,65],[65,52],[52,222],[19,125],[125,141],[141,19],[221,55],[55,65],[65,221],[3,195],[195,197],[197,3],[25,7],[7,33],[33,25],[220,237],[237,44],[44,220],[70,71],[71,139],[139,70],[122,193],[193,245],[245,122],[247,130],[130,33],[33,247],[71,21],[21,162],[162,71],[170,169],[169,150],[150,170],[188,174],[174,196],[196,188],[216,186],[186,92],[92,216],[2,97],[97,167],[167,2],[141,125],[125,241],[241,141],[164,167],[167,37],[37,164],[72,38],[38,12],[12,72],[38,82],[82,13],[13,38],[63,68],[68,71],[71,63],[226,35],[35,111],[111,226],[101,50],[50,205],[205,101],[206,92],[92,165],[165,206],[209,198],[198,217],[217,209],[165,167],[167,97],[97,165],[220,115],[115,218],[218,220],[133,112],[112,243],[243,133],[239,238],[238,241],[241,239],[214,135],[135,169],[169,214],[190,173],[173,133],[133,190],[171,208],[208,32],[32,171],[125,44],[44,237],[237,125],[86,87],[87,178],[178,86],[85,86],[86,179],[179,85],[84,85],[85,180],[180,84],[83,84],[84,181],[181,83],[201,83],[83,182],[182,201],[137,93],[93,132],[132,137],[76,62],[62,183],[183,76],[61,76],[76,184],[184,61],[57,61],[61,185],[185,57],[212,57],[57,186],[186,212],[214,207],[207,187],[187,214],[34,143],[143,156],[156,34],[79,239],[239,237],[237,79],[123,137],[137,177],[177,123],[44,1],[1,4],[4,44],[201,194],[194,32],[32,201],[64,102],[102,129],[129,64],[213,215],[215,138],[138,213],[59,166],[166,219],[219,59],[242,99],[99,97],[97,242],[2,94],[94,141],[141,2],[75,59],[59,235],[235,75],[24,110],[110,228],[228,24],[25,130],[130,226],[226,25],[23,24],[24,229],[229,23],[22,23],[23,230],[230,22],[26,22],[22,231],[231,26],[112,26],[26,232],[232,112],[189,190],[190,243],[243,189],[221,56],[56,190],[190,221],[28,56],[56,221],[221,28],[27,28],[28,222],[222,27],[29,27],[27,223],[223,29],[30,29],[29,224],[224,30],[247,30],[30,225],[225,247],[238,79],[79,20],[20,238],[166,59],[59,75],[75,166],[60,75],[75,240],[240,60],[147,177],[177,215],[215,147],[20,79],[79,166],[166,20],[187,147],[147,213],[213,187],[112,233],[233,244],[244,112],[233,128],[128,245],[245,233],[128,114],[114,188],[188,128],[114,217],[217,174],[174,114],[131,115],[115,220],[220,131],[217,198],[198,236],[236,217],[198,131],[131,134],[134,198],[177,132],[132,58],[58,177],[143,35],[35,124],[124,143],[110,163],[163,7],[7,110],[228,110],[110,25],[25,228],[356,389],[389,368],[368,356],[11,302],[302,267],[267,11],[452,350],[350,349],[349,452],[302,303],[303,269],[269,302],[357,343],[343,277],[277,357],[452,453],[453,357],[357,452],[333,332],[332,297],[297,333],[175,152],[152,377],[377,175],[347,348],[348,330],[330,347],[303,304],[304,270],[270,303],[9,336],[336,337],[337,9],[278,279],[279,360],[360,278],[418,262],[262,431],[431,418],[304,408],[408,409],[409,304],[310,415],[415,407],[407,310],[270,409],[409,410],[410,270],[450,348],[348,347],[347,450],[422,430],[430,434],[434,422],[313,314],[314,17],[17,313],[306,307],[307,375],[375,306],[387,388],[388,260],[260,387],[286,414],[414,398],[398,286],[335,406],[406,418],[418,335],[364,367],[367,416],[416,364],[423,358],[358,327],[327,423],[251,284],[284,298],[298,251],[281,5],[5,4],[4,281],[373,374],[374,253],[253,373],[307,320],[320,321],[321,307],[425,427],[427,411],[411,425],[421,313],[313,18],[18,421],[321,405],[405,406],[406,321],[320,404],[404,405],[405,320],[315,16],[16,17],[17,315],[426,425],[425,266],[266,426],[377,400],[400,369],[369,377],[322,391],[391,269],[269,322],[417,465],[465,464],[464,417],[386,257],[257,258],[258,386],[466,260],[260,388],[388,466],[456,399],[399,419],[419,456],[284,332],[332,333],[333,284],[417,285],[285,8],[8,417],[346,340],[340,261],[261,346],[413,441],[441,285],[285,413],[327,460],[460,328],[328,327],[355,371],[371,329],[329,355],[392,439],[439,438],[438,392],[382,341],[341,256],[256,382],[429,420],[420,360],[360,429],[364,394],[394,379],[379,364],[277,343],[343,437],[437,277],[443,444],[444,283],[283,443],[275,440],[440,363],[363,275],[431,262],[262,369],[369,431],[297,338],[338,337],[337,297],[273,375],[375,321],[321,273],[450,451],[451,349],[349,450],[446,342],[342,467],[467,446],[293,334],[334,282],[282,293],[458,461],[461,462],[462,458],[276,353],[353,383],[383,276],[308,324],[324,325],[325,308],[276,300],[300,293],[293,276],[372,345],[345,447],[447,372],[352,345],[345,340],[340,352],[274,1],[1,19],[19,274],[456,248],[248,281],[281,456],[436,427],[427,425],[425,436],[381,256],[256,252],[252,381],[269,391],[391,393],[393,269],[200,199],[199,428],[428,200],[266,330],[330,329],[329,266],[287,273],[273,422],[422,287],[250,462],[462,328],[328,250],[258,286],[286,384],[384,258],[265,353],[353,342],[342,265],[387,259],[259,257],[257,387],[424,431],[431,430],[430,424],[342,353],[353,276],[276,342],[273,335],[335,424],[424,273],[292,325],[325,307],[307,292],[366,447],[447,345],[345,366],[271,303],[303,302],[302,271],[423,266],[266,371],[371,423],[294,455],[455,460],[460,294],[279,278],[278,294],[294,279],[271,272],[272,304],[304,271],[432,434],[434,427],[427,432],[272,407],[407,408],[408,272],[394,430],[430,431],[431,394],[395,369],[369,400],[400,395],[334,333],[333,299],[299,334],[351,417],[417,168],[168,351],[352,280],[280,411],[411,352],[325,319],[319,320],[320,325],[295,296],[296,336],[336,295],[319,403],[403,404],[404,319],[330,348],[348,349],[349,330],[293,298],[298,333],[333,293],[323,454],[454,447],[447,323],[15,16],[16,315],[315,15],[358,429],[429,279],[279,358],[14,15],[15,316],[316,14],[285,336],[336,9],[9,285],[329,349],[349,350],[350,329],[374,380],[380,252],[252,374],[318,402],[402,403],[403,318],[6,197],[197,419],[419,6],[318,319],[319,325],[325,318],[367,364],[364,365],[365,367],[435,367],[367,397],[397,435],[344,438],[438,439],[439,344],[272,271],[271,311],[311,272],[195,5],[5,281],[281,195],[273,287],[287,291],[291,273],[396,428],[428,199],[199,396],[311,271],[271,268],[268,311],[283,444],[444,445],[445,283],[373,254],[254,339],[339,373],[282,334],[334,296],[296,282],[449,347],[347,346],[346,449],[264,447],[447,454],[454,264],[336,296],[296,299],[299,336],[338,10],[10,151],[151,338],[278,439],[439,455],[455,278],[292,407],[407,415],[415,292],[358,371],[371,355],[355,358],[340,345],[345,372],[372,340],[346,347],[347,280],[280,346],[442,443],[443,282],[282,442],[19,94],[94,370],[370,19],[441,442],[442,295],[295,441],[248,419],[419,197],[197,248],[263,255],[255,359],[359,263],[440,275],[275,274],[274,440],[300,383],[383,368],[368,300],[351,412],[412,465],[465,351],[263,467],[467,466],[466,263],[301,368],[368,389],[389,301],[395,378],[378,379],[379,395],[412,351],[351,419],[419,412],[436,426],[426,322],[322,436],[2,164],[164,393],[393,2],[370,462],[462,461],[461,370],[164,0],[0,267],[267,164],[302,11],[11,12],[12,302],[268,12],[12,13],[13,268],[293,300],[300,301],[301,293],[446,261],[261,340],[340,446],[330,266],[266,425],[425,330],[426,423],[423,391],[391,426],[429,355],[355,437],[437,429],[391,327],[327,326],[326,391],[440,457],[457,438],[438,440],[341,382],[382,362],[362,341],[459,457],[457,461],[461,459],[434,430],[430,394],[394,434],[414,463],[463,362],[362,414],[396,369],[369,262],[262,396],[354,461],[461,457],[457,354],[316,403],[403,402],[402,316],[315,404],[404,403],[403,315],[314,405],[405,404],[404,314],[313,406],[406,405],[405,313],[421,418],[418,406],[406,421],[366,401],[401,361],[361,366],[306,408],[408,407],[407,306],[291,409],[409,408],[408,291],[287,410],[410,409],[409,287],[432,436],[436,410],[410,432],[434,416],[416,411],[411,434],[264,368],[368,383],[383,264],[309,438],[438,457],[457,309],[352,376],[376,401],[401,352],[274,275],[275,4],[4,274],[421,428],[428,262],[262,421],[294,327],[327,358],[358,294],[433,416],[416,367],[367,433],[289,455],[455,439],[439,289],[462,370],[370,326],[326,462],[2,326],[326,370],[370,2],[305,460],[460,455],[455,305],[254,449],[449,448],[448,254],[255,261],[261,446],[446,255],[253,450],[450,449],[449,253],[252,451],[451,450],[450,252],[256,452],[452,451],[451,256],[341,453],[453,452],[452,341],[413,464],[464,463],[463,413],[441,413],[413,414],[414,441],[258,442],[442,441],[441,258],[257,443],[443,442],[442,257],[259,444],[444,443],[443,259],[260,445],[445,444],[444,260],[467,342],[342,445],[445,467],[459,458],[458,250],[250,459],[289,392],[392,290],[290,289],[290,328],[328,460],[460,290],[376,433],[433,435],[435,376],[250,290],[290,392],[392,250],[411,416],[416,433],[433,411],[341,463],[463,464],[464,341],[453,464],[464,465],[465,453],[357,465],[465,412],[412,357],[343,412],[412,399],[399,343],[360,363],[363,440],[440,360],[437,399],[399,456],[456,437],[420,456],[456,363],[363,420],[401,435],[435,288],[288,401],[372,383],[383,353],[353,372],[339,255],[255,249],[249,339],[448,261],[261,255],[255,448],[133,243],[243,190],[190,133],[133,155],[155,112],[112,133],[33,246],[246,247],[247,33],[33,130],[130,25],[25,33],[398,384],[384,286],[286,398],[362,398],[398,414],[414,362],[362,463],[463,341],[341,362],[263,359],[359,467],[467,263],[263,249],[249,255],[255,263],[466,467],[467,260],[260,466],[75,60],[60,166],[166,75],[238,239],[239,79],[79,238],[162,127],[127,139],[139,162],[72,11],[11,37],[37,72],[121,232],[232,120],[120,121],[73,72],[72,39],[39,73],[114,128],[128,47],[47,114],[233,232],[232,128],[128,233],[103,104],[104,67],[67,103],[152,175],[175,148],[148,152],[119,118],[118,101],[101,119],[74,73],[73,40],[40,74],[107,9],[9,108],[108,107],[49,48],[48,131],[131,49],[32,194],[194,211],[211,32],[184,74],[74,185],[185,184],[191,80],[80,183],[183,191],[185,40],[40,186],[186,185],[119,230],[230,118],[118,119],[210,202],[202,214],[214,210],[84,83],[83,17],[17,84],[77,76],[76,146],[146,77],[161,160],[160,30],[30,161],[190,56],[56,173],[173,190],[182,106],[106,194],[194,182],[138,135],[135,192],[192,138],[129,203],[203,98],[98,129],[54,21],[21,68],[68,54],[5,51],[51,4],[4,5],[145,144],[144,23],[23,145],[90,77],[77,91],[91,90],[207,205],[205,187],[187,207],[83,201],[201,18],[18,83],[181,91],[91,182],[182,181],[180,90],[90,181],[181,180],[16,85],[85,17],[17,16],[205,206],[206,36],[36,205],[176,148],[148,140],[140,176],[165,92],[92,39],[39,165],[245,193],[193,244],[244,245],[27,159],[159,28],[28,27],[30,247],[247,161],[161,30],[174,236],[236,196],[196,174],[103,54],[54,104],[104,103],[55,193],[193,8],[8,55],[111,117],[117,31],[31,111],[221,189],[189,55],[55,221],[240,98],[98,99],[99,240],[142,126],[126,100],[100,142],[219,166],[166,218],[218,219],[112,155],[155,26],[26,112],[198,209],[209,131],[131,198],[169,135],[135,150],[150,169],[114,47],[47,217],[217,114],[224,223],[223,53],[53,224],[220,45],[45,134],[134,220],[32,211],[211,140],[140,32],[109,67],[67,108],[108,109],[146,43],[43,91],[91,146],[231,230],[230,120],[120,231],[113,226],[226,247],[247,113],[105,63],[63,52],[52,105],[241,238],[238,242],[242,241],[124,46],[46,156],[156,124],[95,78],[78,96],[96,95],[70,46],[46,63],[63,70],[116,143],[143,227],[227,116],[116,123],[123,111],[111,116],[1,44],[44,19],[19,1],[3,236],[236,51],[51,3],[207,216],[216,205],[205,207],[26,154],[154,22],[22,26],[165,39],[39,167],[167,165],[199,200],[200,208],[208,199],[101,36],[36,100],[100,101],[43,57],[57,202],[202,43],[242,20],[20,99],[99,242],[56,28],[28,157],[157,56],[124,35],[35,113],[113,124],[29,160],[160,27],[27,29],[211,204],[204,210],[210,211],[124,113],[113,46],[46,124],[106,43],[43,204],[204,106],[96,62],[62,77],[77,96],[227,137],[137,116],[116,227],[73,41],[41,72],[72,73],[36,203],[203,142],[142,36],[235,64],[64,240],[240,235],[48,49],[49,64],[64,48],[42,41],[41,74],[74,42],[214,212],[212,207],[207,214],[183,42],[42,184],[184,183],[210,169],[169,211],[211,210],[140,170],[170,176],[176,140],[104,105],[105,69],[69,104],[193,122],[122,168],[168,193],[50,123],[123,187],[187,50],[89,96],[96,90],[90,89],[66,65],[65,107],[107,66],[179,89],[89,180],[180,179],[119,101],[101,120],[120,119],[68,63],[63,104],[104,68],[234,93],[93,227],[227,234],[16,15],[15,85],[85,16],[209,129],[129,49],[49,209],[15,14],[14,86],[86,15],[107,55],[55,9],[9,107],[120,100],[100,121],[121,120],[153,145],[145,22],[22,153],[178,88],[88,179],[179,178],[197,6],[6,196],[196,197],[89,88],[88,96],[96,89],[135,138],[138,136],[136,135],[138,215],[215,172],[172,138],[218,115],[115,219],[219,218],[41,42],[42,81],[81,41],[5,195],[195,51],[51,5],[57,43],[43,61],[61,57],[208,171],[171,199],[199,208],[41,81],[81,38],[38,41],[224,53],[53,225],[225,224],[24,144],[144,110],[110,24],[105,52],[52,66],[66,105],[118,229],[229,117],[117,118],[227,34],[34,234],[234,227],[66,107],[107,69],[69,66],[10,109],[109,151],[151,10],[219,48],[48,235],[235,219],[183,62],[62,191],[191,183],[142,129],[129,126],[126,142],[116,111],[111,143],[143,116],[118,117],[117,50],[50,118],[223,222],[222,52],[52,223],[94,19],[19,141],[141,94],[222,221],[221,65],[65,222],[196,3],[3,197],[197,196],[45,220],[220,44],[44,45],[156,70],[70,139],[139,156],[188,122],[122,245],[245,188],[139,71],[71,162],[162,139],[149,170],[170,150],[150,149],[122,188],[188,196],[196,122],[206,216],[216,92],[92,206],[164,2],[2,167],[167,164],[242,141],[141,241],[241,242],[0,164],[164,37],[37,0],[11,72],[72,12],[12,11],[12,38],[38,13],[13,12],[70,63],[63,71],[71,70],[31,226],[226,111],[111,31],[36,101],[101,205],[205,36],[203,206],[206,165],[165,203],[126,209],[209,217],[217,126],[98,165],[165,97],[97,98],[237,220],[220,218],[218,237],[237,239],[239,241],[241,237],[210,214],[214,169],[169,210],[140,171],[171,32],[32,140],[241,125],[125,237],[237,241],[179,86],[86,178],[178,179],[180,85],[85,179],[179,180],[181,84],[84,180],[180,181],[182,83],[83,181],[181,182],[194,201],[201,182],[182,194],[177,137],[137,132],[132,177],[184,76],[76,183],[183,184],[185,61],[61,184],[184,185],[186,57],[57,185],[185,186],[216,212],[212,186],[186,216],[192,214],[214,187],[187,192],[139,34],[34,156],[156,139],[218,79],[79,237],[237,218],[147,123],[123,177],[177,147],[45,44],[44,4],[4,45],[208,201],[201,32],[32,208],[98,64],[64,129],[129,98],[192,213],[213,138],[138,192],[235,59],[59,219],[219,235],[141,242],[242,97],[97,141],[97,2],[2,141],[141,97],[240,75],[75,235],[235,240],[229,24],[24,228],[228,229],[31,25],[25,226],[226,31],[230,23],[23,229],[229,230],[231,22],[22,230],[230,231],[232,26],[26,231],[231,232],[233,112],[112,232],[232,233],[244,189],[189,243],[243,244],[189,221],[221,190],[190,189],[222,28],[28,221],[221,222],[223,27],[27,222],[222,223],[224,29],[29,223],[223,224],[225,30],[30,224],[224,225],[113,247],[247,225],[225,113],[99,60],[60,240],[240,99],[213,147],[147,215],[215,213],[60,20],[20,166],[166,60],[192,187],[187,213],[213,192],[243,112],[112,244],[244,243],[244,233],[233,245],[245,244],[245,128],[128,188],[188,245],[188,114],[114,174],[174,188],[134,131],[131,220],[220,134],[174,217],[217,236],[236,174],[236,198],[198,134],[134,236],[215,177],[177,58],[58,215],[156,143],[143,124],[124,156],[25,110],[110,7],[7,25],[31,228],[228,25],[25,31],[264,356],[356,368],[368,264],[0,11],[11,267],[267,0],[451,452],[452,349],[349,451],[267,302],[302,269],[269,267],[350,357],[357,277],[277,350],[350,452],[452,357],[357,350],[299,333],[333,297],[297,299],[396,175],[175,377],[377,396],[280,347],[347,330],[330,280],[269,303],[303,270],[270,269],[151,9],[9,337],[337,151],[344,278],[278,360],[360,344],[424,418],[418,431],[431,424],[270,304],[304,409],[409,270],[272,310],[310,407],[407,272],[322,270],[270,410],[410,322],[449,450],[450,347],[347,449],[432,422],[422,434],[434,432],[18,313],[313,17],[17,18],[291,306],[306,375],[375,291],[259,387],[387,260],[260,259],[424,335],[335,418],[418,424],[434,364],[364,416],[416,434],[391,423],[423,327],[327,391],[301,251],[251,298],[298,301],[275,281],[281,4],[4,275],[254,373],[373,253],[253,254],[375,307],[307,321],[321,375],[280,425],[425,411],[411,280],[200,421],[421,18],[18,200],[335,321],[321,406],[406,335],[321,320],[320,405],[405,321],[314,315],[315,17],[17,314],[423,426],[426,266],[266,423],[396,377],[377,369],[369,396],[270,322],[322,269],[269,270],[413,417],[417,464],[464,413],[385,386],[386,258],[258,385],[248,456],[456,419],[419,248],[298,284],[284,333],[333,298],[168,417],[417,8],[8,168],[448,346],[346,261],[261,448],[417,413],[413,285],[285,417],[326,327],[327,328],[328,326],[277,355],[355,329],[329,277],[309,392],[392,438],[438,309],[381,382],[382,256],[256,381],[279,429],[429,360],[360,279],[365,364],[364,379],[379,365],[355,277],[277,437],[437,355],[282,443],[443,283],[283,282],[281,275],[275,363],[363,281],[395,431],[431,369],[369,395],[299,297],[297,337],[337,299],[335,273],[273,321],[321,335],[348,450],[450,349],[349,348],[359,446],[446,467],[467,359],[283,293],[293,282],[282,283],[250,458],[458,462],[462,250],[300,276],[276,383],[383,300],[292,308],[308,325],[325,292],[283,276],[276,293],[293,283],[264,372],[372,447],[447,264],[346,352],[352,340],[340,346],[354,274],[274,19],[19,354],[363,456],[456,281],[281,363],[426,436],[436,425],[425,426],[380,381],[381,252],[252,380],[267,269],[269,393],[393,267],[421,200],[200,428],[428,421],[371,266],[266,329],[329,371],[432,287],[287,422],[422,432],[290,250],[250,328],[328,290],[385,258],[258,384],[384,385],[446,265],[265,342],[342,446],[386,387],[387,257],[257,386],[422,424],[424,430],[430,422],[445,342],[342,276],[276,445],[422,273],[273,424],[424,422],[306,292],[292,307],[307,306],[352,366],[366,345],[345,352],[268,271],[271,302],[302,268],[358,423],[423,371],[371,358],[327,294],[294,460],[460,327],[331,279],[279,294],[294,331],[303,271],[271,304],[304,303],[436,432],[432,427],[427,436],[304,272],[272,408],[408,304],[395,394],[394,431],[431,395],[378,395],[395,400],[400,378],[296,334],[334,299],[299,296],[6,351],[351,168],[168,6],[376,352],[352,411],[411,376],[307,325],[325,320],[320,307],[285,295],[295,336],[336,285],[320,319],[319,404],[404,320],[329,330],[330,349],[349,329],[334,293],[293,333],[333,334],[366,323],[323,447],[447,366],[316,15],[15,315],[315,316],[331,358],[358,279],[279,331],[317,14],[14,316],[316,317],[8,285],[285,9],[9,8],[277,329],[329,350],[350,277],[253,374],[374,252],[252,253],[319,318],[318,403],[403,319],[351,6],[6,419],[419,351],[324,318],[318,325],[325,324],[397,367],[367,365],[365,397],[288,435],[435,397],[397,288],[278,344],[344,439],[439,278],[310,272],[272,311],[311,310],[248,195],[195,281],[281,248],[375,273],[273,291],[291,375],[175,396],[396,199],[199,175],[312,311],[311,268],[268,312],[276,283],[283,445],[445,276],[390,373],[373,339],[339,390],[295,282],[282,296],[296,295],[448,449],[449,346],[346,448],[356,264],[264,454],[454,356],[337,336],[336,299],[299,337],[337,338],[338,151],[151,337],[294,278],[278,455],[455,294],[308,292],[292,415],[415,308],[429,358],[358,355],[355,429],[265,340],[340,372],[372,265],[352,346],[346,280],[280,352],[295,442],[442,282],[282,295],[354,19],[19,370],[370,354],[285,441],[441,295],[295,285],[195,248],[248,197],[197,195],[457,440],[440,274],[274,457],[301,300],[300,368],[368,301],[417,351],[351,465],[465,417],[251,301],[301,389],[389,251],[394,395],[395,379],[379,394],[399,412],[412,419],[419,399],[410,436],[436,322],[322,410],[326,2],[2,393],[393,326],[354,370],[370,461],[461,354],[393,164],[164,267],[267,393],[268,302],[302,12],[12,268],[312,268],[268,13],[13,312],[298,293],[293,301],[301,298],[265,446],[446,340],[340,265],[280,330],[330,425],[425,280],[322,426],[426,391],[391,322],[420,429],[429,437],[437,420],[393,391],[391,326],[326,393],[344,440],[440,438],[438,344],[458,459],[459,461],[461,458],[364,434],[434,394],[394,364],[428,396],[396,262],[262,428],[274,354],[354,457],[457,274],[317,316],[316,402],[402,317],[316,315],[315,403],[403,316],[315,314],[314,404],[404,315],[314,313],[313,405],[405,314],[313,421],[421,406],[406,313],[323,366],[366,361],[361,323],[292,306],[306,407],[407,292],[306,291],[291,408],[408,306],[291,287],[287,409],[409,291],[287,432],[432,410],[410,287],[427,434],[434,411],[411,427],[372,264],[264,383],[383,372],[459,309],[309,457],[457,459],[366,352],[352,401],[401,366],[1,274],[274,4],[4,1],[418,421],[421,262],[262,418],[331,294],[294,358],[358,331],[435,433],[433,367],[367,435],[392,289],[289,439],[439,392],[328,462],[462,326],[326,328],[94,2],[2,370],[370,94],[289,305],[305,455],[455,289],[339,254],[254,448],[448,339],[359,255],[255,446],[446,359],[254,253],[253,449],[449,254],[253,252],[252,450],[450,253],[252,256],[256,451],[451,252],[256,341],[341,452],[452,256],[414,413],[413,463],[463,414],[286,441],[441,414],[414,286],[286,258],[258,441],[441,286],[258,257],[257,442],[442,258],[257,259],[259,443],[443,257],[259,260],[260,444],[444,259],[260,467],[467,445],[445,260],[309,459],[459,250],[250,309],[305,289],[289,290],[290,305],[305,290],[290,460],[460,305],[401,376],[376,435],[435,401],[309,250],[250,392],[392,309],[376,411],[411,433],[433,376],[453,341],[341,464],[464,453],[357,453],[453,465],[465,357],[343,357],[357,412],[412,343],[437,343],[343,399],[399,437],[344,360],[360,440],[440,344],[420,437],[437,456],[456,420],[360,420],[420,363],[363,360],[361,401],[401,288],[288,361],[265,372],[372,353],[353,265],[390,339],[339,249],[249,390],[339,448],[448,255],[255,339]);function Uy(t){t.j={faceLandmarks:[],faceBlendshapes:[],facialTransformationMatrixes:[]}}var Nt=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!1),this.j={faceLandmarks:[],faceBlendshapes:[],facialTransformationMatrixes:[]},this.outputFacialTransformationMatrixes=this.outputFaceBlendshapes=!1,Ne(t=this.h=new aM,0,1,e=new Ot),this.v=new oM,Ne(this.h,0,3,this.v),this.s=new rd,Ne(this.h,0,2,this.s),er(this.s,4,1),Ce(this.s,2,.5),Ce(this.v,2,.5),Ce(this.h,4,.5)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return"numFaces"in t&&er(this.s,4,t.numFaces??1),"minFaceDetectionConfidence"in t&&Ce(this.s,2,t.minFaceDetectionConfidence??.5),"minTrackingConfidence"in t&&Ce(this.h,4,t.minTrackingConfidence??.5),"minFacePresenceConfidence"in t&&Ce(this.v,2,t.minFacePresenceConfidence??.5),"outputFaceBlendshapes"in t&&(this.outputFaceBlendshapes=!!t.outputFaceBlendshapes),"outputFacialTransformationMatrixes"in t&&(this.outputFacialTransformationMatrixes=!!t.outputFacialTransformationMatrixes),this.l(t)}D(t,e){return Uy(this),vi(this,t,e),this.j}F(t,e,n){return Uy(this),tr(this,t,n,e),this.j}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect"),ft(t,"face_landmarks");let e=new Zn;Pi(e,NC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.face_landmarker.FaceLandmarkerGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"NORM_LANDMARKS:face_landmarks"),n.o(e),Qn(t,n),this.g.attachProtoVectorListener("face_landmarks",(i,r)=>{for(let s of i)i=Ql(s),this.j.faceLandmarks.push(sd(i));pe(this,r)}),this.g.attachEmptyPacketListener("face_landmarks",i=>{pe(this,i)}),this.outputFaceBlendshapes&&(ft(t,"blendshapes"),rt(n,"BLENDSHAPES:blendshapes"),this.g.attachProtoVectorListener("blendshapes",(i,r)=>{if(this.outputFaceBlendshapes)for(let s of i)i=id(s),this.j.faceBlendshapes.push(Fg(i.g()??[]));pe(this,r)}),this.g.attachEmptyPacketListener("blendshapes",i=>{pe(this,i)})),this.outputFacialTransformationMatrixes&&(ft(t,"face_geometry"),rt(n,"FACE_GEOMETRY:face_geometry"),this.g.attachProtoVectorListener("face_geometry",(i,r)=>{if(this.outputFacialTransformationMatrixes)for(let s of i)(i=lt(UC(s),TC,2))&&this.j.facialTransformationMatrixes.push({rows:fi(i,1)??0??0,columns:fi(i,2)??0??0,data:Ys(i,3,ss,qs()).slice()??[]});pe(this,r)}),this.g.attachEmptyPacketListener("face_geometry",i=>{pe(this,i)})),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};Nt.prototype.detectForVideo=Nt.prototype.F,Nt.prototype.detect=Nt.prototype.D,Nt.prototype.setOptions=Nt.prototype.o,Nt.createFromModelPath=function(t,e){return it(Nt,t,{baseOptions:{modelAssetPath:e}})},Nt.createFromModelBuffer=function(t,e){return it(Nt,t,{baseOptions:{modelAssetBuffer:e}})},Nt.createFromOptions=function(t,e){return it(Nt,t,e)},Nt.FACE_LANDMARKS_LIPS=Vg,Nt.FACE_LANDMARKS_LEFT_EYE=zg,Nt.FACE_LANDMARKS_LEFT_EYEBROW=Gg,Nt.FACE_LANDMARKS_LEFT_IRIS=NM,Nt.FACE_LANDMARKS_RIGHT_EYE=Wg,Nt.FACE_LANDMARKS_RIGHT_EYEBROW=Xg,Nt.FACE_LANDMARKS_RIGHT_IRIS=DM,Nt.FACE_LANDMARKS_FACE_OVAL=qg,Nt.FACE_LANDMARKS_CONTOURS=OM,Nt.FACE_LANDMARKS_TESSELATION=FM;var Ki=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!0),Ne(t=this.j=new cM,0,1,e=new Ot)}get baseOptions(){return lt(this.j,Ot,1)}set baseOptions(t){Ne(this.j,0,1,t)}o(t){return super.l(t)}Oa(t,e,n){let i=typeof e!="function"?e:{};if(this.h=typeof e=="function"?e:n,vi(this,t,i??{}),!this.h)return this.s}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect"),ft(t,"stylized_image");let e=new Zn;Pi(e,DC,this.j);let n=new An;Jn(n,"mediapipe.tasks.vision.face_stylizer.FaceStylizerGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"STYLIZED_IMAGE:stylized_image"),n.o(e),Qn(t,n),this.g.U("stylized_image",(i,r)=>{var s=!this.h,o=i.data,a=i.width;let l=a*(i=i.height);if(o instanceof Uint8Array)if(o.length===3*l){let c=new Uint8ClampedArray(4*l);for(let u=0;u<l;++u)c[4*u]=o[3*u],c[4*u+1]=o[3*u+1],c[4*u+2]=o[3*u+2],c[4*u+3]=255;o=new ImageData(c,a,i)}else{if(o.length!==4*l)throw Error("Unsupported channel count: "+o.length/l);o=new ImageData(new Uint8ClampedArray(o.buffer,o.byteOffset,o.length),a,i)}else if(!(o instanceof WebGLTexture))throw Error(`Unsupported format: ${o.constructor.name}`);a=new cn([o],!1,!1,this.g.i.canvas,this.O,a,i),this.s=s=s?a.clone():a,this.h&&this.h(s),pe(this,r)}),this.g.attachEmptyPacketListener("stylized_image",i=>{this.s=null,this.h&&this.h(null),pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};Ki.prototype.stylize=Ki.prototype.Oa,Ki.prototype.setOptions=Ki.prototype.o,Ki.createFromModelPath=function(t,e){return it(Ki,t,{baseOptions:{modelAssetPath:e}})},Ki.createFromModelBuffer=function(t,e){return it(Ki,t,{baseOptions:{modelAssetBuffer:e}})},Ki.createFromOptions=function(t,e){return it(Ki,t,e)};var Yg=Ni([0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]);function Ny(t){t.gestures=[],t.landmarks=[],t.worldLandmarks=[],t.handedness=[]}function Dy(t){return t.gestures.length===0?{gestures:[],landmarks:[],worldLandmarks:[],handedness:[],handednesses:[]}:{gestures:t.gestures,landmarks:t.landmarks,worldLandmarks:t.worldLandmarks,handedness:t.handedness,handednesses:t.handedness}}function Oy(t,e=!0){let n=[];for(let r of t){var i=id(r);t=[];for(let s of i.g())i=e&&fi(s,1)!=null?fi(s,1)??0:-1,t.push({score:Xt(s,2)??0,index:i,categoryName:mi(s,3)??""??"",displayName:mi(s,4)??""??""});n.push(t)}return n}var $n=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!1),this.gestures=[],this.landmarks=[],this.worldLandmarks=[],this.handedness=[],Ne(t=this.j=new dM,0,1,e=new Ot),this.s=new Ug,Ne(this.j,0,2,this.s),this.C=new Lg,Ne(this.s,0,3,this.C),this.v=new hM,Ne(this.s,0,2,this.v),this.h=new OC,Ne(this.j,0,3,this.h),Ce(this.v,2,.5),Ce(this.s,4,.5),Ce(this.C,2,.5)}get baseOptions(){return lt(this.j,Ot,1)}set baseOptions(t){Ne(this.j,0,1,t)}o(t){if(er(this.v,3,t.numHands??1),"minHandDetectionConfidence"in t&&Ce(this.v,2,t.minHandDetectionConfidence??.5),"minTrackingConfidence"in t&&Ce(this.s,4,t.minTrackingConfidence??.5),"minHandPresenceConfidence"in t&&Ce(this.C,2,t.minHandPresenceConfidence??.5),t.cannedGesturesClassifierOptions){var e=new ta,n=e,i=Om(t.cannedGesturesClassifierOptions,lt(this.h,ta,3)?.h());Ne(n,0,2,i),Ne(this.h,0,3,e)}else t.cannedGesturesClassifierOptions===void 0&&lt(this.h,ta,3)?.g();return t.customGesturesClassifierOptions?(Ne(n=e=new ta,0,2,i=Om(t.customGesturesClassifierOptions,lt(this.h,ta,4)?.h())),Ne(this.h,0,4,e)):t.customGesturesClassifierOptions===void 0&&lt(this.h,ta,4)?.g(),this.l(t)}Ja(t,e){return Ny(this),vi(this,t,e),Dy(this)}Ka(t,e,n){return Ny(this),tr(this,t,n,e),Dy(this)}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect"),ft(t,"hand_gestures"),ft(t,"hand_landmarks"),ft(t,"world_hand_landmarks"),ft(t,"handedness");let e=new Zn;Pi(e,FC,this.j);let n=new An;Jn(n,"mediapipe.tasks.vision.gesture_recognizer.GestureRecognizerGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"HAND_GESTURES:hand_gestures"),rt(n,"LANDMARKS:hand_landmarks"),rt(n,"WORLD_LANDMARKS:world_hand_landmarks"),rt(n,"HANDEDNESS:handedness"),n.o(e),Qn(t,n),this.g.attachProtoVectorListener("hand_landmarks",(i,r)=>{for(let s of i){i=Ql(s);let o=[];for(let a of Rr(i,tM,1))o.push({x:Xt(a,1)??0,y:Xt(a,2)??0,z:Xt(a,3)??0,visibility:Xt(a,4)??0});this.landmarks.push(o)}pe(this,r)}),this.g.attachEmptyPacketListener("hand_landmarks",i=>{pe(this,i)}),this.g.attachProtoVectorListener("world_hand_landmarks",(i,r)=>{for(let s of i){i=la(s);let o=[];for(let a of Rr(i,eM,1))o.push({x:Xt(a,1)??0,y:Xt(a,2)??0,z:Xt(a,3)??0,visibility:Xt(a,4)??0});this.worldLandmarks.push(o)}pe(this,r)}),this.g.attachEmptyPacketListener("world_hand_landmarks",i=>{pe(this,i)}),this.g.attachProtoVectorListener("hand_gestures",(i,r)=>{this.gestures.push(...Oy(i,!1)),pe(this,r)}),this.g.attachEmptyPacketListener("hand_gestures",i=>{pe(this,i)}),this.g.attachProtoVectorListener("handedness",(i,r)=>{this.handedness.push(...Oy(i)),pe(this,r)}),this.g.attachEmptyPacketListener("handedness",i=>{pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};function Fy(t){return{landmarks:t.landmarks,worldLandmarks:t.worldLandmarks,handednesses:t.handedness,handedness:t.handedness}}$n.prototype.recognizeForVideo=$n.prototype.Ka,$n.prototype.recognize=$n.prototype.Ja,$n.prototype.setOptions=$n.prototype.o,$n.createFromModelPath=function(t,e){return it($n,t,{baseOptions:{modelAssetPath:e}})},$n.createFromModelBuffer=function(t,e){return it($n,t,{baseOptions:{modelAssetBuffer:e}})},$n.createFromOptions=function(t,e){return it($n,t,e)},$n.HAND_CONNECTIONS=Yg;var Tn=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!1),this.landmarks=[],this.worldLandmarks=[],this.handedness=[],Ne(t=this.h=new Ug,0,1,e=new Ot),this.s=new Lg,Ne(this.h,0,3,this.s),this.j=new hM,Ne(this.h,0,2,this.j),er(this.j,3,1),Ce(this.j,2,.5),Ce(this.s,2,.5),Ce(this.h,4,.5)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return"numHands"in t&&er(this.j,3,t.numHands??1),"minHandDetectionConfidence"in t&&Ce(this.j,2,t.minHandDetectionConfidence??.5),"minTrackingConfidence"in t&&Ce(this.h,4,t.minTrackingConfidence??.5),"minHandPresenceConfidence"in t&&Ce(this.s,2,t.minHandPresenceConfidence??.5),this.l(t)}D(t,e){return this.landmarks=[],this.worldLandmarks=[],this.handedness=[],vi(this,t,e),Fy(this)}F(t,e,n){return this.landmarks=[],this.worldLandmarks=[],this.handedness=[],tr(this,t,n,e),Fy(this)}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect"),ft(t,"hand_landmarks"),ft(t,"world_hand_landmarks"),ft(t,"handedness");let e=new Zn;Pi(e,BC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.hand_landmarker.HandLandmarkerGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"LANDMARKS:hand_landmarks"),rt(n,"WORLD_LANDMARKS:world_hand_landmarks"),rt(n,"HANDEDNESS:handedness"),n.o(e),Qn(t,n),this.g.attachProtoVectorListener("hand_landmarks",(i,r)=>{for(let s of i)i=Ql(s),this.landmarks.push(sd(i));pe(this,r)}),this.g.attachEmptyPacketListener("hand_landmarks",i=>{pe(this,i)}),this.g.attachProtoVectorListener("world_hand_landmarks",(i,r)=>{for(let s of i)i=la(s),this.worldLandmarks.push(Gl(i));pe(this,r)}),this.g.attachEmptyPacketListener("world_hand_landmarks",i=>{pe(this,i)}),this.g.attachProtoVectorListener("handedness",(i,r)=>{var s=this.handedness,o=s.push;let a=[];for(let l of i){i=id(l);let c=[];for(let u of i.g())c.push({score:Xt(u,2)??0,index:fi(u,1)??0??-1,categoryName:mi(u,3)??""??"",displayName:mi(u,4)??""??""});a.push(c)}o.call(s,...a),pe(this,r)}),this.g.attachEmptyPacketListener("handedness",i=>{pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};Tn.prototype.detectForVideo=Tn.prototype.F,Tn.prototype.detect=Tn.prototype.D,Tn.prototype.setOptions=Tn.prototype.o,Tn.createFromModelPath=function(t,e){return it(Tn,t,{baseOptions:{modelAssetPath:e}})},Tn.createFromModelBuffer=function(t,e){return it(Tn,t,{baseOptions:{modelAssetBuffer:e}})},Tn.createFromOptions=function(t,e){return it(Tn,t,e)},Tn.HAND_CONNECTIONS=Yg;var BM=Ni([0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],[12,14],[14,16],[16,18],[16,20],[16,22],[18,20],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32],[27,31],[28,32]);function By(t){t.h={faceLandmarks:[],faceBlendshapes:[],poseLandmarks:[],poseWorldLandmarks:[],poseSegmentationMasks:[],leftHandLandmarks:[],leftHandWorldLandmarks:[],rightHandLandmarks:[],rightHandWorldLandmarks:[]}}function ky(t){try{if(!t.C)return t.h;t.C(t.h)}finally{ad(t)}}function Mh(t,e){t=Ql(t),e.push(sd(t))}var Ut=class extends Bn{constructor(t,e){super(new _i(t,e),"input_frames_image",null,!1),this.h={faceLandmarks:[],faceBlendshapes:[],poseLandmarks:[],poseWorldLandmarks:[],poseSegmentationMasks:[],leftHandLandmarks:[],leftHandWorldLandmarks:[],rightHandLandmarks:[],rightHandWorldLandmarks:[]},this.outputPoseSegmentationMasks=this.outputFaceBlendshapes=!1,Ne(t=this.j=new _M,0,1,e=new Ot),this.J=new Lg,Ne(this.j,0,2,this.J),this.Z=new kC,Ne(this.j,0,3,this.Z),this.s=new rd,Ne(this.j,0,4,this.s),this.H=new oM,Ne(this.j,0,5,this.H),this.v=new mM,Ne(this.j,0,6,this.v),this.K=new gM,Ne(this.j,0,7,this.K),Ce(this.s,2,.5),Ce(this.s,3,.3),Ce(this.H,2,.5),Ce(this.v,2,.5),Ce(this.v,3,.3),Ce(this.K,2,.5),Ce(this.J,2,.5)}get baseOptions(){return lt(this.j,Ot,1)}set baseOptions(t){Ne(this.j,0,1,t)}o(t){return"minFaceDetectionConfidence"in t&&Ce(this.s,2,t.minFaceDetectionConfidence??.5),"minFaceSuppressionThreshold"in t&&Ce(this.s,3,t.minFaceSuppressionThreshold??.3),"minFacePresenceConfidence"in t&&Ce(this.H,2,t.minFacePresenceConfidence??.5),"outputFaceBlendshapes"in t&&(this.outputFaceBlendshapes=!!t.outputFaceBlendshapes),"minPoseDetectionConfidence"in t&&Ce(this.v,2,t.minPoseDetectionConfidence??.5),"minPoseSuppressionThreshold"in t&&Ce(this.v,3,t.minPoseSuppressionThreshold??.3),"minPosePresenceConfidence"in t&&Ce(this.K,2,t.minPosePresenceConfidence??.5),"outputPoseSegmentationMasks"in t&&(this.outputPoseSegmentationMasks=!!t.outputPoseSegmentationMasks),"minHandLandmarksConfidence"in t&&Ce(this.J,2,t.minHandLandmarksConfidence??.5),this.l(t)}D(t,e,n){let i=typeof e!="function"?e:{};return this.C=typeof e=="function"?e:n,By(this),vi(this,t,i),ky(this)}F(t,e,n,i){let r=typeof n!="function"?n:{};return this.C=typeof n=="function"?n:i,By(this),tr(this,t,r,e),ky(this)}m(){var t=new kn;Pt(t,"input_frames_image"),ft(t,"pose_landmarks"),ft(t,"pose_world_landmarks"),ft(t,"face_landmarks"),ft(t,"left_hand_landmarks"),ft(t,"left_hand_world_landmarks"),ft(t,"right_hand_landmarks"),ft(t,"right_hand_world_landmarks");let e=new Zn,n=new ry;Cm(n,1,Ma("type.googleapis.com/mediapipe.tasks.vision.holistic_landmarker.proto.HolisticLandmarkerGraphOptions"),""),function(r,s){if(s!=null)if(Array.isArray(s))Rt(r,2,h1(s));else{if(!(typeof s=="string"||s instanceof wr||jl(s)))throw Error("invalid value in Any.value field: "+s+" expected a ByteString, a base64 encoded string, a Uint8Array or a jspb array");Cm(r,2,Zm(s,!1),Zs())}}(n,this.j.g());let i=new An;Jn(i,"mediapipe.tasks.vision.holistic_landmarker.HolisticLandmarkerGraph"),Uh(i,8,ry,n),Ct(i,"IMAGE:input_frames_image"),rt(i,"POSE_LANDMARKS:pose_landmarks"),rt(i,"POSE_WORLD_LANDMARKS:pose_world_landmarks"),rt(i,"FACE_LANDMARKS:face_landmarks"),rt(i,"LEFT_HAND_LANDMARKS:left_hand_landmarks"),rt(i,"LEFT_HAND_WORLD_LANDMARKS:left_hand_world_landmarks"),rt(i,"RIGHT_HAND_LANDMARKS:right_hand_landmarks"),rt(i,"RIGHT_HAND_WORLD_LANDMARKS:right_hand_world_landmarks"),i.o(e),Qn(t,i),od(this,t),this.g.attachProtoListener("pose_landmarks",(r,s)=>{Mh(r,this.h.poseLandmarks),pe(this,s)}),this.g.attachEmptyPacketListener("pose_landmarks",r=>{pe(this,r)}),this.g.attachProtoListener("pose_world_landmarks",(r,s)=>{var o=this.h.poseWorldLandmarks;r=la(r),o.push(Gl(r)),pe(this,s)}),this.g.attachEmptyPacketListener("pose_world_landmarks",r=>{pe(this,r)}),this.outputPoseSegmentationMasks&&(rt(i,"POSE_SEGMENTATION_MASK:pose_segmentation_mask"),ma(this,"pose_segmentation_mask"),this.g.U("pose_segmentation_mask",(r,s)=>{this.h.poseSegmentationMasks=[va(this,r,!0,!this.C)],pe(this,s)}),this.g.attachEmptyPacketListener("pose_segmentation_mask",r=>{this.h.poseSegmentationMasks=[],pe(this,r)})),this.g.attachProtoListener("face_landmarks",(r,s)=>{Mh(r,this.h.faceLandmarks),pe(this,s)}),this.g.attachEmptyPacketListener("face_landmarks",r=>{pe(this,r)}),this.outputFaceBlendshapes&&(ft(t,"extra_blendshapes"),rt(i,"FACE_BLENDSHAPES:extra_blendshapes"),this.g.attachProtoListener("extra_blendshapes",(r,s)=>{var o=this.h.faceBlendshapes;this.outputFaceBlendshapes&&(r=id(r),o.push(Fg(r.g()??[]))),pe(this,s)}),this.g.attachEmptyPacketListener("extra_blendshapes",r=>{pe(this,r)})),this.g.attachProtoListener("left_hand_landmarks",(r,s)=>{Mh(r,this.h.leftHandLandmarks),pe(this,s)}),this.g.attachEmptyPacketListener("left_hand_landmarks",r=>{pe(this,r)}),this.g.attachProtoListener("left_hand_world_landmarks",(r,s)=>{var o=this.h.leftHandWorldLandmarks;r=la(r),o.push(Gl(r)),pe(this,s)}),this.g.attachEmptyPacketListener("left_hand_world_landmarks",r=>{pe(this,r)}),this.g.attachProtoListener("right_hand_landmarks",(r,s)=>{Mh(r,this.h.rightHandLandmarks),pe(this,s)}),this.g.attachEmptyPacketListener("right_hand_landmarks",r=>{pe(this,r)}),this.g.attachProtoListener("right_hand_world_landmarks",(r,s)=>{var o=this.h.rightHandWorldLandmarks;r=la(r),o.push(Gl(r)),pe(this,s)}),this.g.attachEmptyPacketListener("right_hand_world_landmarks",r=>{pe(this,r)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};Ut.prototype.detectForVideo=Ut.prototype.F,Ut.prototype.detect=Ut.prototype.D,Ut.prototype.setOptions=Ut.prototype.o,Ut.createFromModelPath=function(t,e){return it(Ut,t,{baseOptions:{modelAssetPath:e}})},Ut.createFromModelBuffer=function(t,e){return it(Ut,t,{baseOptions:{modelAssetBuffer:e}})},Ut.createFromOptions=function(t,e){return it(Ut,t,e)},Ut.HAND_CONNECTIONS=Yg,Ut.POSE_CONNECTIONS=BM,Ut.FACE_LANDMARKS_LIPS=Vg,Ut.FACE_LANDMARKS_LEFT_EYE=zg,Ut.FACE_LANDMARKS_LEFT_EYEBROW=Gg,Ut.FACE_LANDMARKS_LEFT_IRIS=NM,Ut.FACE_LANDMARKS_RIGHT_EYE=Wg,Ut.FACE_LANDMARKS_RIGHT_EYEBROW=Xg,Ut.FACE_LANDMARKS_RIGHT_IRIS=DM,Ut.FACE_LANDMARKS_FACE_OVAL=qg,Ut.FACE_LANDMARKS_CONTOURS=OM,Ut.FACE_LANDMARKS_TESSELATION=FM;var ui=class extends Bn{constructor(t,e){super(new _i(t,e),"input_image","norm_rect",!0),this.j={classifications:[]},Ne(t=this.h=new vM,0,1,e=new Ot)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return Ne(this.h,0,2,Om(t,lt(this.h,Cg,2))),this.l(t)}sa(t,e){return this.j={classifications:[]},vi(this,t,e),this.j}ta(t,e,n){return this.j={classifications:[]},tr(this,t,n,e),this.j}m(){var t=new kn;Pt(t,"input_image"),Pt(t,"norm_rect"),ft(t,"classifications");let e=new Zn;Pi(e,HC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.image_classifier.ImageClassifierGraph"),Ct(n,"IMAGE:input_image"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"CLASSIFICATIONS:classifications"),n.o(e),Qn(t,n),this.g.attachProtoListener("classifications",(i,r)=>{this.j=function(s){let o={classifications:Rr(s,wC,1).map(a=>Fg(lt(a,K1,4)?.g()??[],fi(a,2)??0,mi(a,3)??""))};return Lh(fa(s,2))!=null&&(o.timestampMs=Lh(fa(s,2))??0),o}(AC(i)),pe(this,r)}),this.g.attachEmptyPacketListener("classifications",i=>{pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};ui.prototype.classifyForVideo=ui.prototype.ta,ui.prototype.classify=ui.prototype.sa,ui.prototype.setOptions=ui.prototype.o,ui.createFromModelPath=function(t,e){return it(ui,t,{baseOptions:{modelAssetPath:e}})},ui.createFromModelBuffer=function(t,e){return it(ui,t,{baseOptions:{modelAssetBuffer:e}})},ui.createFromOptions=function(t,e){return it(ui,t,e)};var jn=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!0),this.h=new xM,this.embeddings={embeddings:[]},Ne(t=this.h,0,1,e=new Ot)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){var e=this.h,n=lt(this.h,fy,2);return n=n?n.clone():new fy,t.l2Normalize!==void 0?ql(n,1,t.l2Normalize):"l2Normalize"in t&&Rt(n,1),t.quantize!==void 0?ql(n,2,t.quantize):"quantize"in t&&Rt(n,2),Ne(e,0,2,n),this.l(t)}za(t,e){return vi(this,t,e),this.embeddings}Aa(t,e,n){return tr(this,t,n,e),this.embeddings}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect"),ft(t,"embeddings_out");let e=new Zn;Pi(e,VC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.image_embedder.ImageEmbedderGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"EMBEDDINGS:embeddings_out"),n.o(e),Qn(t,n),this.g.attachProtoListener("embeddings_out",(i,r)=>{i=IC(i),this.embeddings=function(s){return{embeddings:Rr(s,CC,1).map(o=>{let a={headIndex:fi(o,3)??0??-1,headName:mi(o,4)??""??""};if(g1(o,dy,gm(o,1))!==void 0)o=Ys(o=lt(o,dy,gm(o,1)),1,ss,qs()),a.floatEmbedding=o.slice();else{let l=new Uint8Array(0);a.quantizedEmbedding=lt(o,RC,gm(o,2))?.oa()?.h()??l}return a}),timestampMs:Lh(fa(s,2))??0}}(i),pe(this,r)}),this.g.attachEmptyPacketListener("embeddings_out",i=>{pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};jn.cosineSimilarity=function(t,e){if(t.floatEmbedding&&e.floatEmbedding)t=vy(t.floatEmbedding,e.floatEmbedding);else{if(!t.quantizedEmbedding||!e.quantizedEmbedding)throw Error("Cannot compute cosine similarity between quantized and float embeddings.");t=vy(_y(t.quantizedEmbedding),_y(e.quantizedEmbedding))}return t},jn.prototype.embedForVideo=jn.prototype.Aa,jn.prototype.embed=jn.prototype.za,jn.prototype.setOptions=jn.prototype.o,jn.createFromModelPath=function(t,e){return it(jn,t,{baseOptions:{modelAssetPath:e}})},jn.createFromModelBuffer=function(t,e){return it(jn,t,{baseOptions:{modelAssetBuffer:e}})},jn.createFromOptions=function(t,e){return it(jn,t,e)};var Hm=class{constructor(t,e,n){this.confidenceMasks=t,this.categoryMask=e,this.qualityScores=n}close(){this.confidenceMasks?.forEach(t=>{t.close()}),this.categoryMask?.close()}};function Hy(t){t.categoryMask=void 0,t.confidenceMasks=void 0,t.qualityScores=void 0}function Vy(t){try{let e=new Hm(t.confidenceMasks,t.categoryMask,t.qualityScores);if(!t.j)return e;t.j(e)}finally{ad(t)}}Hm.prototype.close=Hm.prototype.close;var On=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!1),this.s=[],this.outputCategoryMask=!1,this.outputConfidenceMasks=!0,this.h=new Og,this.v=new yM,Ne(this.h,0,3,this.v),Ne(t=this.h,0,1,e=new Ot)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return t.displayNamesLocale!==void 0?Rt(this.h,2,Ma(t.displayNamesLocale)):"displayNamesLocale"in t&&Rt(this.h,2),"outputCategoryMask"in t&&(this.outputCategoryMask=t.outputCategoryMask??!1),"outputConfidenceMasks"in t&&(this.outputConfidenceMasks=t.outputConfidenceMasks??!0),super.l(t)}I(){(function(t){let e=Rr(t.da(),An,1).filter(n=>(mi(n,1)??"").includes("mediapipe.tasks.TensorsToSegmentationCalculator"));if(t.s=[],e.length>1)throw Error("The graph has more than one mediapipe.tasks.TensorsToSegmentationCalculator.");e.length===1&&(lt(e[0],Zn,7)?.l()?.g()??new Map).forEach((n,i)=>{t.s[Number(i)]=mi(n,1)??""})})(this)}segment(t,e,n){let i=typeof e!="function"?e:{};return this.j=typeof e=="function"?e:n,Hy(this),vi(this,t,i),Vy(this)}Ma(t,e,n,i){let r=typeof n!="function"?n:{};return this.j=typeof n=="function"?n:i,Hy(this),tr(this,t,r,e),Vy(this)}Da(){return this.s}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect");let e=new Zn;Pi(e,EM,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.image_segmenter.ImageSegmenterGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),n.o(e),Qn(t,n),od(this,t),this.outputConfidenceMasks&&(ft(t,"confidence_masks"),rt(n,"CONFIDENCE_MASKS:confidence_masks"),ma(this,"confidence_masks"),this.g.ca("confidence_masks",(i,r)=>{this.confidenceMasks=i.map(s=>va(this,s,!0,!this.j)),pe(this,r)}),this.g.attachEmptyPacketListener("confidence_masks",i=>{this.confidenceMasks=[],pe(this,i)})),this.outputCategoryMask&&(ft(t,"category_mask"),rt(n,"CATEGORY_MASK:category_mask"),ma(this,"category_mask"),this.g.U("category_mask",(i,r)=>{this.categoryMask=va(this,i,!1,!this.j),pe(this,r)}),this.g.attachEmptyPacketListener("category_mask",i=>{this.categoryMask=void 0,pe(this,i)})),ft(t,"quality_scores"),rt(n,"QUALITY_SCORES:quality_scores"),this.g.attachFloatVectorListener("quality_scores",(i,r)=>{this.qualityScores=i,pe(this,r)}),this.g.attachEmptyPacketListener("quality_scores",i=>{this.categoryMask=void 0,pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};On.prototype.getLabels=On.prototype.Da,On.prototype.segmentForVideo=On.prototype.Ma,On.prototype.segment=On.prototype.segment,On.prototype.setOptions=On.prototype.o,On.createFromModelPath=function(t,e){return it(On,t,{baseOptions:{modelAssetPath:e}})},On.createFromModelBuffer=function(t,e){return it(On,t,{baseOptions:{modelAssetBuffer:e}})},On.createFromOptions=function(t,e){return it(On,t,e)};var Vm=class{constructor(t,e,n){this.confidenceMasks=t,this.categoryMask=e,this.qualityScores=n}close(){this.confidenceMasks?.forEach(t=>{t.close()}),this.categoryMask?.close()}};Vm.prototype.close=Vm.prototype.close;var KC=class extends Se{constructor(t){super(t)}},na=[0,Wt,-2],Fh=[0,Sr,-3,Dt,Sr,-1],zy=[0,Fh],Gy=[0,Fh,Wt,-1],Sm=class extends Se{constructor(t){super(t)}},Wy=[0,Sr,-1,Dt],JC=class extends Se{constructor(t){super(t)}},Xy=class extends Se{constructor(t){super(t)}},zm=[1,2,3,4,5,6,7,8,9,10,14,15],kM=class extends Se{constructor(t){super(t)}};kM.prototype.g=nd([0,rn,[0,zm,Et,Fh,Et,[0,Fh,na],Et,zy,Et,[0,zy,na],Et,Wy,Et,[0,Sr,-3,Dt,gi],Et,[0,Sr,-3,Dt],Et,[0,vt,Sr,-2,Dt,Wt,Dt,-1,2,Sr,na],Et,Gy,Et,[0,Gy,na],Sr,na,vt,Et,[0,Sr,-3,Dt,na,-1],Et,[0,rn,Wy]],vt,[0,vt,Wt,-1,Dt]]);var Ji=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect_in",!1),this.outputCategoryMask=!1,this.outputConfidenceMasks=!0,this.h=new Og,this.s=new yM,Ne(this.h,0,3,this.s),Ne(t=this.h,0,1,e=new Ot)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return"outputCategoryMask"in t&&(this.outputCategoryMask=t.outputCategoryMask??!1),"outputConfidenceMasks"in t&&(this.outputConfidenceMasks=t.outputConfidenceMasks??!0),super.l(t)}segment(t,e,n,i){let r=typeof n!="function"?n:{};this.j=typeof n=="function"?n:i,this.qualityScores=this.categoryMask=this.confidenceMasks=void 0,n=this.B+1,i=new kM;let s=new Xy;var o=new KC;if(er(o,1,255),Ne(s,0,12,o),e.keypoint&&e.scribble)throw Error("Cannot provide both keypoint and scribble.");if(e.keypoint){var a=new Sm;ql(a,3,!0),Ce(a,1,e.keypoint.x),Ce(a,2,e.keypoint.y),Vl(s,5,zm,a)}else{if(!e.scribble)throw Error("Must provide either a keypoint or a scribble.");for(a of(o=new JC,e.scribble))ql(e=new Sm,3,!0),Ce(e,1,a.x),Ce(e,2,a.y),Uh(o,1,Sm,e);Vl(s,15,zm,o)}Uh(i,1,Xy,s),this.g.addProtoToStream(i.g(),"drishti.RenderData","roi_in",n),vi(this,t,r);e:{try{let c=new Vm(this.confidenceMasks,this.categoryMask,this.qualityScores);if(!this.j){var l=c;break e}this.j(c)}finally{ad(this)}l=void 0}return l}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"roi_in"),Pt(t,"norm_rect_in");let e=new Zn;Pi(e,EM,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.interactive_segmenter.InteractiveSegmenterGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"ROI:roi_in"),Ct(n,"NORM_RECT:norm_rect_in"),n.o(e),Qn(t,n),od(this,t),this.outputConfidenceMasks&&(ft(t,"confidence_masks"),rt(n,"CONFIDENCE_MASKS:confidence_masks"),ma(this,"confidence_masks"),this.g.ca("confidence_masks",(i,r)=>{this.confidenceMasks=i.map(s=>va(this,s,!0,!this.j)),pe(this,r)}),this.g.attachEmptyPacketListener("confidence_masks",i=>{this.confidenceMasks=[],pe(this,i)})),this.outputCategoryMask&&(ft(t,"category_mask"),rt(n,"CATEGORY_MASK:category_mask"),ma(this,"category_mask"),this.g.U("category_mask",(i,r)=>{this.categoryMask=va(this,i,!1,!this.j),pe(this,r)}),this.g.attachEmptyPacketListener("category_mask",i=>{this.categoryMask=void 0,pe(this,i)})),ft(t,"quality_scores"),rt(n,"QUALITY_SCORES:quality_scores"),this.g.attachFloatVectorListener("quality_scores",(i,r)=>{this.qualityScores=i,pe(this,r)}),this.g.attachEmptyPacketListener("quality_scores",i=>{this.categoryMask=void 0,pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};Ji.prototype.segment=Ji.prototype.segment,Ji.prototype.setOptions=Ji.prototype.o,Ji.createFromModelPath=function(t,e){return it(Ji,t,{baseOptions:{modelAssetPath:e}})},Ji.createFromModelBuffer=function(t,e){return it(Ji,t,{baseOptions:{modelAssetBuffer:e}})},Ji.createFromOptions=function(t,e){return it(Ji,t,e)};var hi=class extends Bn{constructor(t,e){super(new _i(t,e),"input_frame_gpu","norm_rect",!1),this.j={detections:[]},Ne(t=this.h=new SM,0,1,e=new Ot)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return t.displayNamesLocale!==void 0?Rt(this.h,2,Ma(t.displayNamesLocale)):"displayNamesLocale"in t&&Rt(this.h,2),t.maxResults!==void 0?er(this.h,3,t.maxResults):"maxResults"in t&&Rt(this.h,3),t.scoreThreshold!==void 0?Ce(this.h,4,t.scoreThreshold):"scoreThreshold"in t&&Rt(this.h,4),t.categoryAllowlist!==void 0?Nh(this.h,5,t.categoryAllowlist):"categoryAllowlist"in t&&Rt(this.h,5),t.categoryDenylist!==void 0?Nh(this.h,6,t.categoryDenylist):"categoryDenylist"in t&&Rt(this.h,6),this.l(t)}D(t,e){return this.j={detections:[]},vi(this,t,e),this.j}F(t,e,n){return this.j={detections:[]},tr(this,t,n,e),this.j}m(){var t=new kn;Pt(t,"input_frame_gpu"),Pt(t,"norm_rect"),ft(t,"detections");let e=new Zn;Pi(e,GC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.ObjectDetectorGraph"),Ct(n,"IMAGE:input_frame_gpu"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"DETECTIONS:detections"),n.o(e),Qn(t,n),this.g.attachProtoVectorListener("detections",(i,r)=>{for(let s of i)i=Q1(s),this.j.detections.push(bM(i));pe(this,r)}),this.g.attachEmptyPacketListener("detections",i=>{pe(this,i)}),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};hi.prototype.detectForVideo=hi.prototype.F,hi.prototype.detect=hi.prototype.D,hi.prototype.setOptions=hi.prototype.o,hi.createFromModelPath=async function(t,e){return it(hi,t,{baseOptions:{modelAssetPath:e}})},hi.createFromModelBuffer=function(t,e){return it(hi,t,{baseOptions:{modelAssetBuffer:e}})},hi.createFromOptions=function(t,e){return it(hi,t,e)};var Gm=class{constructor(t,e,n){this.landmarks=t,this.worldLandmarks=e,this.segmentationMasks=n}close(){this.segmentationMasks?.forEach(t=>{t.close()})}};function qy(t){t.landmarks=[],t.worldLandmarks=[],t.segmentationMasks=void 0}function Yy(t){try{let e=new Gm(t.landmarks,t.worldLandmarks,t.segmentationMasks);if(!t.s)return e;t.s(e)}finally{ad(t)}}Gm.prototype.close=Gm.prototype.close;var bn=class extends Bn{constructor(t,e){super(new _i(t,e),"image_in","norm_rect",!1),this.landmarks=[],this.worldLandmarks=[],this.outputSegmentationMasks=!1,Ne(t=this.h=new TM,0,1,e=new Ot),this.v=new gM,Ne(this.h,0,3,this.v),this.j=new mM,Ne(this.h,0,2,this.j),er(this.j,4,1),Ce(this.j,2,.5),Ce(this.v,2,.5),Ce(this.h,4,.5)}get baseOptions(){return lt(this.h,Ot,1)}set baseOptions(t){Ne(this.h,0,1,t)}o(t){return"numPoses"in t&&er(this.j,4,t.numPoses??1),"minPoseDetectionConfidence"in t&&Ce(this.j,2,t.minPoseDetectionConfidence??.5),"minTrackingConfidence"in t&&Ce(this.h,4,t.minTrackingConfidence??.5),"minPosePresenceConfidence"in t&&Ce(this.v,2,t.minPosePresenceConfidence??.5),"outputSegmentationMasks"in t&&(this.outputSegmentationMasks=t.outputSegmentationMasks??!1),this.l(t)}D(t,e,n){let i=typeof e!="function"?e:{};return this.s=typeof e=="function"?e:n,qy(this),vi(this,t,i),Yy(this)}F(t,e,n,i){let r=typeof n!="function"?n:{};return this.s=typeof n=="function"?n:i,qy(this),tr(this,t,r,e),Yy(this)}m(){var t=new kn;Pt(t,"image_in"),Pt(t,"norm_rect"),ft(t,"normalized_landmarks"),ft(t,"world_landmarks"),ft(t,"segmentation_masks");let e=new Zn;Pi(e,WC,this.h);let n=new An;Jn(n,"mediapipe.tasks.vision.pose_landmarker.PoseLandmarkerGraph"),Ct(n,"IMAGE:image_in"),Ct(n,"NORM_RECT:norm_rect"),rt(n,"NORM_LANDMARKS:normalized_landmarks"),rt(n,"WORLD_LANDMARKS:world_landmarks"),n.o(e),Qn(t,n),od(this,t),this.g.attachProtoVectorListener("normalized_landmarks",(i,r)=>{this.landmarks=[];for(let s of i)i=Ql(s),this.landmarks.push(sd(i));pe(this,r)}),this.g.attachEmptyPacketListener("normalized_landmarks",i=>{this.landmarks=[],pe(this,i)}),this.g.attachProtoVectorListener("world_landmarks",(i,r)=>{this.worldLandmarks=[];for(let s of i)i=la(s),this.worldLandmarks.push(Gl(i));pe(this,r)}),this.g.attachEmptyPacketListener("world_landmarks",i=>{this.worldLandmarks=[],pe(this,i)}),this.outputSegmentationMasks&&(rt(n,"SEGMENTATION_MASK:segmentation_masks"),ma(this,"segmentation_masks"),this.g.ca("segmentation_masks",(i,r)=>{this.segmentationMasks=i.map(s=>va(this,s,!0,!this.s)),pe(this,r)}),this.g.attachEmptyPacketListener("segmentation_masks",i=>{this.segmentationMasks=[],pe(this,i)})),t=t.g(),this.setGraph(new Uint8Array(t),!0)}};bn.prototype.detectForVideo=bn.prototype.F,bn.prototype.detect=bn.prototype.D,bn.prototype.setOptions=bn.prototype.o,bn.createFromModelPath=function(t,e){return it(bn,t,{baseOptions:{modelAssetPath:e}})},bn.createFromModelBuffer=function(t,e){return it(bn,t,{baseOptions:{modelAssetBuffer:e}})},bn.createFromOptions=function(t,e){return it(bn,t,e)},bn.POSE_CONNECTIONS=BM;var $g=t=>t&&(t.visibility??1)>=.3;function HM(t,e,{aspect:n=4/3,maxDist:i=.28,mirroredInput:r=!1}={}){let s=(t||[]).filter(d=>d&&d.world&&d.world.length>=21).slice(0,2),o=e?{left:e[15],right:e[16]}:null;if(!o||!($g(o.left)||$g(o.right)))return QC(s,r);let a=(d,f)=>{let g=o[f],_=d.image&&d.image[0];if(!$g(g)||!_)return 1/0;let m=Math.hypot((_.x-g.x)*n,_.y-g.y);return m<=i?m:1/0},l=["left","right",null],c=null,u=(d,f,g,_)=>{if(d===s.length){(!c||g>c.placed||g===c.placed&&_<c.total)&&(c={picked:f.slice(),placed:g,total:_});return}for(let m of l){if(m&&f.includes(m))continue;let p=m?a(s[d],m):0;p!==1/0&&(f.push(m),u(d+1,f,g+(m?1:0),_+p),f.pop())}};u(0,[],0,0);let h={left:null,right:null};return c&&c.picked.forEach((d,f)=>{d&&(h[d]=s[f].world)}),h}function QC(t,e){let n={left:null,right:null},i={left:-1,right:-1};for(let r of t){if(r.label!=="Left"&&r.label!=="Right")continue;let s=r.label==="Left"===e?"left":"right",o=r.score??0;o>i[s]&&(i[s]=o,n[s]=r.world)}return n}var ud=t=>typeof t=="number"&&Number.isFinite(t),as=t=>ud(t)?t<0?0:t>1?1:t:0;function eI(t,{floorDb:e=-50,fullDb:n=-20}={}){return!ud(t)||n<=e?0:as((t-e)/(n-e))}function zM(t,e,n){let i=t||{};if(!i.speaking)return{...i,aa:as(i.aa)};let r=["aa","ih","ou","ee","oh"].reduce((o,a)=>o+as(i[a]),0),s=.6*eI(e,n);return r>=s?i:{...i,aa:as((i.aa||0)+(s-r))}}var VM=[61,291],tI=0,nI=17;function iI(t,e=.5){let n=t;if(!n||n.length<292)return null;let[i,r,s,o]=[n[VM[0]],n[VM[1]],n[tI],n[nI]];if(![i,r,s,o].every(h=>h&&ud(h.x)&&ud(h.y)))return null;let a=Math.abs(r.x-i.x),l=Math.max(Math.abs(o.y-s.y),a*.4),c=(i.x+r.x)/2,u=(s.y+o.y)/2;return{x0:c-a*(.5+e),x1:c+a*(.5+e),y0:u-l*(.5+e),y1:u+l*(.5+e)}}function GM(t,e){let n=iI(t);if(!n||!e||!e.length)return 0;let i=0;for(let r of e){let s=r&&r.image;if(s)for(let o of s)o&&o.x>=n.x0&&o.x<=n.x1&&o.y>=n.y0&&o.y<=n.y1&&i++}return as(i/4)}var hd=class{constructor({disagreeMs:e=500,speakingAbove:n=.15,shutBelow:i=.04}={}){Object.assign(this,{disagreeMs:e,speakingAbove:n,shutBelow:i}),this.since=null}update({faceSeen:e,cover:n=0,trackedAa:i=0,audio:r=null},s){if(!e)return this.since=null,0;let o=1-.9*as(n);return!!r&&r.speaking&&as(r.level)>=this.speakingAbove&&as(i)<this.shutBelow?(this.since===null&&(this.since=s),s-this.since>=this.disagreeMs&&(o=Math.min(o,.3))):this.since=null,o}};var WM=(t,e)=>1/(1+1/(2*Math.PI*t*e)),Js=class{constructor(e=1.2,n=.05,i=1){this.minCutoff=e,this.beta=n,this.dCutoff=i,this.x=null,this.dx=0,this.t=null}filter(e,n){if(this.x===null||this.t===null||n<=this.t)return this.x=e,this.t=n,this.dx=0,e;let i=n-this.t,r=(e-this.x)/i;this.dx+=WM(this.dCutoff,i)*(r-this.dx);let s=this.minCutoff+this.beta*Math.abs(this.dx);return this.x+=WM(s,i)*(e-this.x),this.t=n,this.x}},dd=class{constructor(e,n){this.f=[0,1,2,3].map(()=>new Js(e,n)),this.prev=null}filter(e,n){let[i,r,s,o]=e;this.prev&&this.prev[0]*i+this.prev[1]*r+this.prev[2]*s+this.prev[3]*o<0&&(i=-i,r=-r,s=-s,o=-o);let a=[i,r,s,o].map((c,u)=>this.f[u].filter(c,n)),l=Math.hypot(...a)||1;return this.prev=a.map(c=>c/l),this.prev}};var XM={leftUpperArm:[0,0,-1.15],rightUpperArm:[0,0,1.15],leftLowerArm:[0,.1,.12],rightLowerArm:[0,-.1,-.12]},rI={leftUpperArm:[.35,0,-1.05],rightUpperArm:[.35,0,1.05],leftLowerArm:[0,-1,0],rightLowerArm:[0,1,0]};function fd(t=!1){let e=t?{...XM,...rI}:XM,n={};for(let i of Ht){let r=e[i];n[i]=r?new he().setFromEuler(new ln(r[0],r[1],r[2],"YXZ")):new he}return n}var e0=(t,e)=>(t&1<<Ul.indexOf(e))!==0,sI=t=>Ul.reduce((e,n,i)=>e|(t[n]?1<<i:0),0),tc=(t,e)=>{let n=10**e;return Math.round(t*n)/n},oI={eye:[4,.8],head:[2.5,.4],torso:[1.2,.2],arm:[1.5,.35],finger:[2,.5],leg:[1.2,.25]},Qg=/(UpperLeg|LowerLeg|Foot|Toes)$/;function pd(t){return/Eye$/.test(t)?"eye":t==="neck"||t==="head"?"head":t==="hips"||t==="spine"||t==="chest"?"torso":/(Thumb|Index|Middle|Ring|Little)/.test(t)?"finger":Qg.test(t)?"leg":"arm"}var aI=t=>t.startsWith("left")?"left":t.startsWith("right")?"right":null,qM=t=>new dd(...oI[pd(t)]),YM=t=>t.startsWith("blink")?new Js(3,1):new Js(2,.5),$M=()=>[0,1,2].map(()=>new Js(1,.05)),lI={quats:null,expr:{},live:{},solved:new Set},md=class{constructor({holdMs:e=250,fadeMs:n=600,resumeMs:i=150,legs:r="auto",legsStableMs:s=600,desk:o=!1,deskHoldMs:a=1500,deskFadeMs:l=900,idle:c=fd(o)}={}){this.cfg={holdMs:e,fadeMs:n,resumeMs:i,legs:o?"off":r,legsStableMs:s,desk:o},this.idle=Object.fromEntries(Ht.map(h=>[h,[c[h].x,c[h].y,c[h].z,c[h].w]]));let u=h=>o&&pd(h)!=="head"&&pd(h)!=="eye"&&pd(h)!=="torso"&&!Qg.test(h);this.bones=Object.fromEntries(Ht.map(h=>[h,{f:qM(h),last:null,lastLive:-1/0,w:0,...u(h)?{hold:a,fade:l}:{}}])),this.expr=Object.fromEntries($r.map(h=>[h,{f:YM(h),last:0,lastLive:-1/0,w:0}])),this.rootState={f:$M(),last:[0,0,1],lastLive:-1/0,w:0},this.legState={left:{since:null,lastSeen:-1/0},right:{since:null,lastSeen:-1/0}},this.lastT=null}set legsMode(e){this.cfg.legs=this.cfg.desk?"off":e}update(e,n,i=null){let r=e||lI,s=this.lastT===null?0:Math.min(100,Math.max(0,n-this.lastT));this.lastT=n;let o=this.trustedLegs(r.solved,n),a={};for(let g of Ht){let _=this.bones[g],m=Qg.test(g)?aI(g):null,p=r.solved.has(g)?r.quats[g]:null,E=p!==null&&Number.isFinite(p.x+p.y+p.z+p.w)&&(m===null||o[m]);if(E){n-_.lastLive>(_.hold??this.cfg.holdMs)+(_.fade??this.cfg.fadeMs)&&(_.f=qM(g));let T=r.quats[g];_.last=_.f.filter([T.x,T.y,T.z,T.w],n/1e3)}a[g]=this.blend(_,E,n,s,this.idle[g],_.last)}let l=Object.keys(r.expr||{}).length>0,c={};for(let g of $r){let _=this.expr[g],m=r.expr[g]??0,p=l&&Number.isFinite(m);p&&(n-_.lastLive>this.cfg.holdMs+this.cfg.fadeMs&&(_.f=YM(g)),_.last=_.f.filter(m,n/1e3)),c[g]=this.blendScalar(_,p,n,s,0)}let u=this.rootState;i=i&&i.every(Number.isFinite)?i:null,i&&(n-u.lastLive>this.cfg.holdMs+this.cfg.fadeMs&&(u.f=$M()),u.last=i.map((g,_)=>u.f[_].filter(g,n/1e3)));let h=[0,0,1],d=this.blendVector(u,!!i,n,s,h),f={...r.live||{},legs:o.left||o.right};return{quats:a,expr:c,root:d,flags:sI(f)}}weight(e,n,i,r){if(n)return e.lastLive=i,e.w=Math.min(1,e.w+r/this.cfg.resumeMs),e.w<1&&r===0&&(e.w=1),e.w;let s=i-e.lastLive,o=e.hold??this.cfg.holdMs,a=e.fade??this.cfg.fadeMs,l=s<=o?1:Math.max(0,1-(s-o)/a);return e.w=Math.min(e.w,l),e.w}blend(e,n,i,r,s,o){let a=this.weight(e,n,i,r);if(!o||a<=0)return s.slice();let l=new he(s[0],s[1],s[2],s[3]).slerp(new he(o[0],o[1],o[2],o[3]),a);return[l.x,l.y,l.z,l.w]}blendScalar(e,n,i,r,s){let o=this.weight(e,n,i,r);return s+(e.last-s)*o}blendVector(e,n,i,r,s){let o=this.weight(e,n,i,r);return e.last.map((a,l)=>s[l]+(a-s[l])*o)}trustedLegs(e,n){let i={left:!1,right:!1};for(let r of["left","right"]){let s=this.legState[r],o=e.has(`${r}UpperLeg`)&&e.has(`${r}LowerLeg`);o?(s.since===null&&(s.since=n),s.lastSeen=n):n-s.lastSeen>200&&(s.since=null);let a=this.cfg.legs;i[r]=a==="on"?o:a==="off"?!1:o&&s.since!==null&&n-s.since>=this.cfg.legsStableMs}return i}},Pr={quatBound:1.0001,normMin:.9,normMax:1.1,exprMin:-.01,exprMax:1.01,rootXY:4,depthMin:.05,depthMax:6};function ZM({quats:t,expr:e,flags:n,root:i}){let r=[];for(let s of Ht)for(let o of t[s])r.push(tc(o,4));return{type:"body",f:n,q:r,e:$r.map(s=>tc(e[s]??0,3)),r:(i||[0,0,1]).map(s=>tc(s,3))}}var jg=t=>typeof t=="number"&&Number.isFinite(t);function KM(t){if(!t||typeof t!="object"||Array.isArray(t))return null;let e=Object.keys(t);if(e.length!==5||!["type","f","q","e","r"].every(o=>e.includes(o))||t.type!=="body"||!Number.isInteger(t.f)||t.f<0||t.f>=1<<Ul.length)return null;let{q:n,e:i,r}=t;if(!Array.isArray(n)||n.length!==Px||!n.every(o=>jg(o)&&Math.abs(o)<=Pr.quatBound)||!Array.isArray(i)||i.length!==$r.length||!i.every(o=>jg(o)&&o>=Pr.exprMin&&o<=Pr.exprMax)||!Array.isArray(r)||r.length!==3||!r.every(jg)||Math.abs(r[0])>Pr.rootXY||Math.abs(r[1])>Pr.rootXY||r[2]<Pr.depthMin||r[2]>Pr.depthMax)return null;let s={};for(let o=0;o<Ht.length;o++){let a=n.slice(o*4,o*4+4),l=Math.hypot(...a);if(l<Pr.normMin||l>Pr.normMax)return null;s[Ht[o]]=a.map(c=>c/l)}return{flags:Object.fromEntries(Ul.map(o=>[o,e0(t.f,o)])),quats:s,expr:Object.fromEntries($r.map((o,a)=>[o,i[a]])),root:r.slice()}}var Zg={low:{width:320,height:240,budgetMs:25},balanced:{width:640,height:480,budgetMs:40},high:{width:1280,height:720,budgetMs:60}},JM=t=>typeof t=="string"&&Object.hasOwn(Zg,t)?Zg[t]:Zg.balanced,cI=["camera","models","running","error","stopped"],jM=(t,e=200)=>String(t??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,e),ls=(t,e=0,n=0,i=1e6)=>typeof t=="number"&&Number.isFinite(t)&&t>=n&&t<=i?tc(t,e):null,Kg=(t,e,n)=>Object.fromEntries(e.map(i=>[i,n(t&&typeof t=="object"?t[i]:void 0)]));function QM({info:t=null,state:e="camera",detail:n="",mic:i=null,avSyncMs:r=null}={}){let s=t||{},o=s.diag&&typeof s.diag=="object"?s.diag:null;return{type:"realx-stats",fps:ls(s.fps,1,0,1e3),skipped:ls(s.skipped,0,0,1e9),latencyMs:ls(s.latencyMs,0,0,6e4),hz:Kg(s.hz,["pose","face","hands"],a=>ls(a,0,0,1e3)),ms:Kg(s.ms,["pose","face","hands"],a=>ls(a,0,0,6e4)),delegates:Kg(s.delegates,["pose","face","hands"],a=>a==="GPU"||a==="CPU"?a:null),diag:o&&{face:o.face===!0,pose:o.pose===!0,hands:Number.isInteger(o.hands)&&o.hands>0?Math.min(o.hands,2):0,handHint:jM(o.handHint),wrists:[0,1].map(a=>{let l=Array.isArray(o.wrists)?o.wrists[a]:null;return typeof l=="number"&&Number.isFinite(l)?tc(Math.min(1,Math.max(0,l)),2):null})},mic:i&&typeof i=="object"?{active:i.active===!0,speaking:i.speaking===!0,levelDb:ls(i.levelDb,0,-200,20),latencyMs:ls(i.latencyMs,0,0,5e3)}:null,avSyncMs:ls(r,0,-5e3,5e3),state:cI.includes(e)?e:"error",detail:jM(n)}}var uI=[11,12],hI=t=>{let e=t.slice().sort((n,i)=>n-i);return e[e.length>>1]},gd=class{constructor({mirror:e=!0,calibrationFrames:n=20}={}){this.mirror=e,this.need=n,this.recenter()}recenter(){this.samples=[],this.neutral=null}update(e,n=4/3){if(!e)return null;let[i,r]=uI.map(l=>e[l]);if(!i||!r||(i.visibility??1)<.5||(r.visibility??1)<.5)return null;let s=(i.x+r.x)/2,o=(i.y+r.y)/2,a=Math.hypot((i.x-r.x)*n,i.y-r.y);if(!(a>1e-4))return null;if(!this.neutral){this.samples.push([s,o,a]);let l=[0,1,2].map(c=>hI(this.samples.map(u=>u[c])));return this.samples.length>=this.need&&(this.neutral=l),this.offset([s,o,a],l)}return this.offset([s,o,a],this.neutral)}offset([e,n,i],[r,s,o]){let a=(l,c,u)=>Math.min(u,Math.max(c,l));return[a((e-r)*2*(this.mirror?-1:1),-3,3),a((n-s)*2,-3,3),a(i/o,.3,3)]}},Jg=["pose","face","hands"],dI={pose:40,face:100,hands:100},_d=class{constructor({budgetMs:e=40,targets:n=dI}={}){this.budget=e,this.targets=n,this.cost={pose:30,face:30,hands:30},this.last={pose:-1/0,face:-1/0,hands:-1/0}}due(e,n){let i=n-this.last[e];return Number.isFinite(i)?i/this.targets[e]:1e9-Jg.indexOf(e)}plan(e){let n={face:!1,pose:!1,hands:!1},i=0;for(let r of Jg.slice().sort((s,o)=>this.due(o,e)-this.due(s,e)))i>0&&i+this.cost[r]>this.budget||(n[r]=!0,i+=this.cost[r],this.last[r]=e);return n}report(e){for(let n of Jg)Number.isFinite(e[n])&&(this.cost[n]=.8*this.cost[n]+.2*e[n])}};var fI=new Set(["NotAllowedError","SecurityError"]),vd=(t,e=200)=>String(t??"").replace(/[\u0000-\u001f\u007f]/g,"").slice(0,e),t0=class{constructor({minMs:e=1e3,maxMs:n=15e3,factor:i=2}={}){this.minMs=e,this.maxMs=n,this.factor=i,this.attempts=0}next(){let e=Math.min(this.maxMs,this.minMs*this.factor**this.attempts);return this.attempts++,e}reset(){this.attempts=0}},Ra=class{constructor({kind:e,start:n,explain:i=null,onState:r=()=>{},backoff:s=new t0,setTimer:o=(l,c)=>setTimeout(l,c),clearTimer:a=l=>clearTimeout(l)}){this.kind=e,this.startDevice=n,this.explain=i,this.onState=r,this.backoff=s,this.setTimer=o,this.clearTimer=a,this.state="idle",this.handle=null,this.timer=null,this.stopped=!1,this.onEnded=()=>this.lost()}async run(){await this.attempt()}async attempt(){if(this.stopped)return;let e;try{e=await this.startDevice()}catch(n){return this.failed(n)}if(this.stopped){this.release(e);return}this.handle=e;for(let n of e?.tracks??[])n.addEventListener("ended",this.onEnded);this.backoff.reset(),this.emit("running")}lost(){this.state!=="running"||this.stopped||(this.release(this.handle),this.handle=null,this.emit("lost",`The ${this.kind} was disconnected or stopped. Trying to reconnect\u2026`,""),this.schedule())}failed(e){if(this.stopped)return;let n=vd(`${e?.name??"Error"}: ${e?.message??e}`),i=null;try{i=this.explain?vd(this.explain(e),140):null}catch{}if(fI.has(e?.name)){this.emit("blocked",`${i||`The ${this.kind} permission was refused.`} Allow it in the browser's address bar, then reload.`,n);return}this.emit("lost",`${i||`The ${this.kind} is not available.`} Trying again\u2026`,n),this.schedule()}schedule(){let e=this.backoff.next();this.nextRetryMs=e,this.emitAgain(),this.timer=this.setTimer(()=>{this.timer=null,this.attempt()},e)}stop(){this.stopped=!0,this.timer!==null&&(this.clearTimer(this.timer),this.timer=null),this.release(this.handle),this.handle=null,this.emit("stopped")}release(e){for(let n of e?.tracks??[])n.removeEventListener("ended",this.onEnded);try{e?.stop?.()}catch{}}emit(e,n="",i=""){this.state=e,this.last={kind:this.kind,state:e,message:vd(n),detail:vd(i),attempt:this.backoff.attempts,nextRetryMs:null},this.onState(this.last)}emitAgain(){this.last={...this.last,attempt:this.backoff.attempts,nextRetryMs:this.nextRetryMs},this.onState(this.last)}};var pI=300,mI=3e3;async function eE({solver:t,mirror:e=!0,legs:n="auto",desk:i=!1,delegate:r="auto",base:s="",video:o=null,deviceId:a=null,quality:l="balanced",onFrame:c,onHands:u=null,onStatus:h=()=>{}}){let d=JM(l),f=(ce,fe="")=>h(ce,fe),g=!1,_=null,m=!1,p=!1,E=performance.now();o=o||document.createElement("video"),o.muted=!0,o.playsInline=!0;let T=async()=>{let ce=await navigator.mediaDevices.getUserMedia({video:{...a?{deviceId:{exact:a}}:{facingMode:"user"},width:{ideal:d.width},height:{ideal:d.height},frameRate:{ideal:30}},audio:!1});return o.srcObject=ce,await o.play(),p=!0,E=performance.now(),{tracks:ce.getVideoTracks(),stop(){ce.getTracks().forEach(fe=>fe.stop()),o.srcObject===ce&&(o.srcObject=null)}}},v=new Ra({kind:"camera",start:T,explain:n0,onState:ce=>{m&&(ce.state==="running"?f("running"):(ce.state==="lost"||ce.state==="blocked")&&f("error",ce.message))}}),C={},A={};try{if(f("camera"),await v.run(),v.state==="blocked")throw new Error(v.last.message);f("models");let ce=await Zr.forVisionTasks(`${s}/mp/wasm`),fe=I=>`${s}/mp/models/${I}`,at=(I,At)=>gI(I,At,r,A,C),Ze=(await Promise.allSettled([at("face",I=>Nt.createFromOptions(ce,{baseOptions:{modelAssetPath:fe("face_landmarker.task"),delegate:I},runningMode:"VIDEO",numFaces:1,outputFaceBlendshapes:!0})),at("pose",I=>bn.createFromOptions(ce,{baseOptions:{modelAssetPath:fe("pose_landmarker_lite.task"),delegate:I},runningMode:"VIDEO",numPoses:1})),at("hands",I=>Tn.createFromOptions(ce,{baseOptions:{modelAssetPath:fe("hand_landmarker.task"),delegate:I},runningMode:"VIDEO",numHands:2,minHandDetectionConfidence:.4,minHandPresenceConfidence:.4}))])).find(I=>I.status==="rejected");if(Ze)throw Ze.reason}catch(ce){return Te(),f("error",n0(ce)),{stop(){},recenter(){},setLegs(){},stats:()=>({})}}let b=new md({legs:n,desk:i}),P=new gd({mirror:e}),S=new _d({budgetMs:d.budgetMs}),y={face:null,pose:null,hands:null},L={face:0,pose:0,hands:0},F={fps:0,interval:33,ms:{face:0,pose:0,hands:0},hz:{face:0,pose:0,hands:0},frames:0,delegates:A,diag:null,skipped:0,latencyMs:null},B=0,G=null,$=null,z=0,J=(ce,fe)=>{B=fe.presentedFrames??B,G=Number.isFinite(fe.captureTime)?fe.captureTime:null,g||o.requestVideoFrameCallback(J)};o.requestVideoFrameCallback&&o.requestVideoFrameCallback(J);let V=0,re=-1,te=0,we=0,qe=performance.now();function ot(){if(!g){if(o.readyState>=2&&o.currentTime!==re){re=o.currentTime,E=performance.now();try{ne(),we=0}catch(ce){if(++we>=5){f("error",n0(ce)),ye(!0);return}}}q()}}let q=()=>{g||(o.readyState>=2&&o.currentTime!==re?setTimeout(ot,0):o.requestVideoFrameCallback?o.requestVideoFrameCallback(ot):requestAnimationFrame(ot))};function ne(){let ce=performance.now();V=Math.max(V+1,ce);let fe=S.plan(ce),at={};for(let D of["pose","face","hands"]){if(!fe[D])continue;let X=performance.now(),j=C[D].detectForVideo(o,V);at[D]=performance.now()-X,F.ms[D]=.8*F.ms[D]+.2*at[D],y[D]={t:ce,result:j},L[D]++}if(S.report(at),ce-qe>=1e3){for(let D of Object.keys(L))F.hz[D]=Math.round(L[D]*1e3/(ce-qe)),L[D]=0;qe=ce}let pt=o.videoWidth/Math.max(1,o.videoHeight),Ze=Math.max(pI,8*F.interval),I=D=>D&&ce-D.t<=Ze?D.result:null,At=I(y.face),$e=I(y.pose),Je=I(y.hands),_e=$e&&$e.landmarks&&$e.landmarks[0]?$e.landmarks[0]:null,Ke=$e&&$e.worldLandmarks&&$e.worldLandmarks[0]?$e.worldLandmarks[0]:null,Ae=Je&&Je.landmarks?Je.landmarks.map((D,X)=>({image:D,world:Je.worldLandmarks[X],label:Je.handedness?.[X]?.[0]?.categoryName??null,score:Je.handedness?.[X]?.[0]?.score??0})):[],ke=At&&At.faceLandmarks&&At.faceLandmarks[0]?{landmarks:At.faceLandmarks[0],blend:Object.fromEntries((At.faceBlendshapes?.[0]?.categories??[]).map(D=>[D.categoryName,D.score])),aspect:pt}:null;if(u&&fe.hands&&Je)try{u(Ae,ce)}catch{}F.mouthCover=GM(ke?ke.landmarks:null,Ae);let Ft=HM(Ae,_e,{aspect:pt}),R=t.solve({pose:Ke?{world:Ke}:null,hands:Ft,face:ke});F.diag=_I({face:ke,poseWorld:Ke,hands:Ae,assigned:Ft,solved:R,poseImage:_e});let x=ZM(b.update(R,ce,P.update(_e,pt)));F.frames++,p&&($=null,z=0,p=!1),z++,B>0&&($===null&&($=B-1),F.skipped=Math.max(0,B-$-z)),G!==null&&(F.latencyMs=Math.max(0,performance.now()-G)),te&&(F.interval=.9*F.interval+.1*(ce-te),F.fps=1e3/Math.max(1,F.interval)),te=ce,c(x,F)}function ye(ce=!1){g||(g=!0,window.removeEventListener("pagehide",ae),Te(),ce||f("stopped"))}let ae=()=>ye();window.addEventListener("pagehide",ae);function Te(){for(let ce of Object.values(C))try{ce.close()}catch{}_!==null&&clearInterval(_),v.stop()}return m=!0,v.state==="running"?f("running"):v.last&&f("error",v.last.message),_=setInterval(()=>{g||v.state!=="running"||document.visibilityState!=="visible"||performance.now()-E>mI&&v.lost()},1e3),q(),{stop:ye,recenter:()=>P.recenter(),setLegs:ce=>{b.legsMode=ce},stats:()=>F}}async function gI(t,e,n,i,r){let s=n==="cpu"?["CPU"]:n==="gpu"?["GPU"]:["GPU","CPU"],o;for(let a of s)try{r[t]=await e(a),i[t]=a;return}catch(l){o=l}throw o}function _I({face:t,poseWorld:e,hands:n,assigned:i,solved:r,poseImage:s}){let o=l=>s&&s[l]?Math.round((s[l].visibility??1)*100)/100:null,a;return e?n.length===0?a="no hand seen: raise it into view, palm toward the camera":!i.left&&!i.right?a="hand seen, but it is not next to a wrist the body model found":!r.live.leftHand&&!r.live.rightHand?a="hand found, but its arm is not visible enough":a=`${(r.live.leftHand?1:0)+(r.live.rightHand?1:0)} hand(s) tracked`:a="no body seen",{face:!!t,pose:!!e,hands:n.length,handHint:a,wrists:[o(15),o(16)]}}function n0(t){return t&&t.name==="NotAllowedError"?"Camera permission was refused.":t&&t.name==="NotFoundError"?"No camera was found.":t&&t.name==="OverconstrainedError"?"That camera is not available. Choose another one.":t&&t.name==="NotReadableError"?"The camera is busy in another app, or it was unplugged.":String(t&&t.message||t).slice(0,200)}var cs=t=>t<0?0:t>1?1:t;function tE(t,e,{live:n=!1,faceSeen:i=!1,idleBlink:r=0,smile:s=0,boost:o={}}={}){let a=c=>e[c]||0,l=c=>o[c]||0;if(n){t.setValue("blink",Math.max(a("blink"),i?0:r));for(let c of["blinkLeft","blinkRight","aa","ih","ou","ee"])t.setValue(c,a(c));t.setValue("happy",cs(Math.max(a("happy"),l("happy")))),t.setValue("oh",cs(Math.max(a("oh"),l("oh")))),t.setValue("angry",cs(a("angry"))),t.setValue("surprised",cs(Math.max(a("surprised"),l("surprised"))))}else t.setValue("blink",r),t.setValue("happy",cs(cs(s)*.9+l("happy"))),t.setValue("oh",cs(l("oh"))),t.setValue("angry",0),t.setValue("surprised",cs(l("surprised")))}async function iE({deviceId:t,onFeatures:e,intervalMs:n=20}={}){let i=globalThis.navigator&&globalThis.navigator.mediaDevices;if(!i||typeof i.getUserMedia!="function")throw new Error("Microphone access is not available in this browser.");let r={echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0,channelCount:1};t&&(r.deviceId={exact:t});let s;try{s=await i.getUserMedia({audio:r,video:!1})}catch(p){throw new Error(nE(p))}let o=null,a=null,l=!1,c=()=>{if(a!==null&&(clearInterval(a),a=null),s.getTracks().forEach(p=>p.stop()),o)try{Promise.resolve(o.close()).catch(()=>{})}catch{}},u;try{let p=globalThis.AudioContext??globalThis.webkitAudioContext;o=new p,u=o.createAnalyser(),u.fftSize=1024,u.smoothingTimeConstant=0,o.createMediaStreamSource(s).connect(u),o.state==="suspended"&&typeof o.resume=="function"&&o.resume().catch(()=>{})}catch(p){throw c(),new Error(nE(p))}let h=new Float32Array(u.fftSize),d=new Float32Array(u.frequencyBinCount);a=setInterval(()=>{u.getFloatTimeDomainData(h),u.getFloatFrequencyData(d);let p=0;for(let v=0;v<h.length;v++)p+=h[v]*h[v];let E=Math.sqrt(p/h.length),T=E>1e-5?20*Math.log10(E):-100;try{e({levelDb:T,freqDb:d,sampleRate:o.sampleRate,fftSize:u.fftSize,t:performance.now()})}catch{}},n);let g=()=>_();function _(){l||(l=!0,globalThis.window&&typeof window.removeEventListener=="function"&&window.removeEventListener("pagehide",g),c())}globalThis.window&&typeof window.addEventListener=="function"&&window.addEventListener("pagehide",g);let m=s.getAudioTracks?s.getAudioTracks()[0]:null;return{stop:_,tracks:m?[m]:[],label:m&&m.label||"",latencyMs:(o.baseLatency||0)*1e3+u.fftSize/o.sampleRate*1e3}}function nE(t){let e=t&&t.name;return e==="NotAllowedError"||e==="SecurityError"?"Microphone permission was refused.":e==="NotFoundError"||e==="OverconstrainedError"?"No microphone was found.":e==="NotReadableError"?"The microphone is in use by another app.":String(t&&t.message||t).slice(0,200)}var us=Object.freeze({CLOSED_FIST:"Closed_Fist",THUMB_UP:"Thumb_Up",VICTORY:"Victory",OPEN_PALM:"Open_Palm"}),vI=Object.freeze({[us.CLOSED_FIST]:"toggle-mic",[us.THUMB_UP]:"emote-happy",[us.VICTORY]:"emote-wave",[us.OPEN_PALM]:"recenter"}),xI=[[5,6,8],[9,10,12],[13,14,16],[17,18,20]],hs=(t,e)=>Math.hypot(t.x-e.x,t.y-e.y,(t.z??0)-(e.z??0));function yI(t,[,e,n]){return hs(t[n],t[0])>hs(t[e],t[0])*1.12}function MI(t){return hs(t[4],t[17])>hs(t[3],t[17])*1.08&&hs(t[4],t[5])>hs(t[3],t[5])*1.05}function EI(t){let e=t&&t.image,n=t&&(t.world||t.image)||null;if(!e||!n||e.length<21||n.length<21)return null;let i=xI.map(o=>yI(n,o)),r=MI(n),s=i.filter(Boolean).length;if(s===4&&r)return us.OPEN_PALM;if(i[0]&&i[1]&&!i[2]&&!i[3]&&hs(n[8],n[12])>hs(n[5],n[9])*1.25)return us.VICTORY;if(s===0){let o=e[3].y-e[4].y,a=Math.abs(e[4].x-e[3].x);return r&&o>0&&o>a*1.5&&e[4].y<e[2].y&&e[4].y<e[5].y?us.THUMB_UP:r?null:us.CLOSED_FIST}return null}function SI(t){let e=(t||[]).slice().sort((n,i)=>(i.score||0)-(n.score||0));for(let n of e){let i=EI(n);if(i)return i}return null}var i0=class{constructor({frames:e=3,holdMs:n=300,cooldownMs:i=1500,graceFrames:r=1}={}){this.frames=e,this.holdMs=n,this.cooldownMs=i,this.graceFrames=r,this.reset()}reset(){this.cand=null,this.count=0,this.since=0,this.misses=0,this.fired=!1,this.lastFire={}}update(e,n){return e===null?(this.cand!==null&&++this.misses<=this.graceFrames||(this.cand=null,this.count=0,this.misses=0,this.fired=!1),null):(this.misses=0,e!==this.cand?(this.cand=e,this.count=1,this.since=n,this.fired=!1,null):(this.count++,this.fired||this.count<this.frames||n-this.since<this.holdMs||n-(this.lastFire[e]??-1/0)<this.cooldownMs?null:(this.fired=!0,this.lastFire[e]=n,e)))}},xd=class{constructor(e={}){this.debounce=new i0(e),this.enabled=!0,this.last=null}setEnabled(e){this.enabled=!!e,this.enabled||this.debounce.reset()}feed(e,n){if(!this.enabled)return null;let i=this.debounce.update(SI(e),n);return i?(this.last={gesture:i,action:vI[i],at:n},this.last):null}};var rE=(t,e,n)=>t<e?e:t>n?n:t,Qs=(t,e,n)=>t+(e-t)*n,TI=(t,e,n)=>.2126*t+.7152*e+.0722*n;function bI(t){let e=0,n=0,i=0,r=0;for(let o=0;o+3<t.length;o+=4){let a=t[o+3]/255;a<=0||(e+=t[o]*a,n+=t[o+1]*a,i+=t[o+2]*a,r+=a)}if(r===0)return null;let s={r:e/r/255,g:n/r/255,b:i/r/255};return{...s,luma:TI(s.r,s.g,s.b)}}function wI({r:t,g:e,b:n},i=.5){let r=s=>Qs(1,s,i);return{r:r(t),g:r(e),b:r(n)}}function AI(t,{min:e=.2,max:n=1.2}={}){return rE(Qs(e,n,rE(t,0,1)),e,n)}var RI=(t,e)=>1-Math.exp(-Math.max(0,t)/Math.max(1e-6,e));function sE(t,{size:e=16,createCanvas:n=()=>document.createElement("canvas")}={}){let i=n();i.width=e,i.height=e;let r=i.getContext("2d",{willReadFrequently:!0});return()=>{try{return r.clearRect(0,0,e,e),r.drawImage(t,0,0,e,e),r.getImageData(0,0,e,e).data}catch{return null}}}var yd=class{constructor({ambient:e,sun:n=null,sample:i,intervalMs:r=500,tau:s=.8,minIntensity:o=.2,maxIntensity:a=1.2,sunShare:l=.75}){Object.assign(this,{ambient:e,sun:n,sample:i,intervalMs:r,tau:s,minIntensity:o,maxIntensity:a,sunShare:l}),this.sunBase=n?n.intensity:0,this.neutral={tint:{r:1,g:1,b:1},intensity:e.intensity},this.enabled=!0,this.lastSample=-1/0,this.target=this.neutral,this.shown={r:e.color.r,g:e.color.g,b:e.color.b,intensity:e.intensity}}setEnabled(e){this.enabled=!!e}setSample(e){this.sample=e,this.lastSample=-1/0,e||(this.target=this.neutral)}update(e,n){if(!this.enabled)return;if(e-this.lastSample>=this.intervalMs){this.lastSample=e;let a=this.sample?bI(this.sample()??[]):null;a&&(this.target={tint:wI(a),intensity:AI(a.luma,{min:this.minIntensity,max:this.maxIntensity})})}let i=RI(n,this.tau),r=this.shown,s=this.target;r.r=Qs(r.r,s.tint.r,i),r.g=Qs(r.g,s.tint.g,i),r.b=Qs(r.b,s.tint.b,i),r.intensity=Qs(r.intensity,s.intensity,i);let o=Math.max(this.minIntensity,r.intensity);this.ambient.color.setRGB?this.ambient.color.setRGB(r.r,r.g,r.b):Object.assign(this.ambient.color,{r:r.r,g:r.g,b:r.b}),this.ambient.intensity=o,this.sun&&(this.sun.color.setRGB?this.sun.color.setRGB(r.r,r.g,r.b):Object.assign(this.sun.color,{r:r.r,g:r.g,b:r.b}),this.sun.intensity=this.sunBase*Qs(1,o,this.sunShare))}};var Ca=["aa","ih","ou","ee","oh"],ei=t=>typeof t=="number"&&Number.isFinite(t),nc=(t,e,n)=>t<e?e:t>n?n:t,eo=t=>ei(t)?nc(t,0,1):0,Sd=()=>({aa:0,ih:0,ou:0,ee:0,oh:0}),r0=class{constructor({hangoverMs:e=200,onDb:n=10,offDb:i=5,riseDbPerS:r=1.5,fallDbPerS:s=60,minFloorDb:o=-100}={}){this.cfg={hangoverMs:e,onDb:n,offDb:i,riseDbPerS:r,fallDbPerS:s,minFloorDb:o},this.floor=null,this.speaking=!1,this.lastLoud=-1/0,this.t=null}update(e,n){let i=this.cfg,r=ei(n)&&(this.t===null||n>=this.t)?n:this.t??0,s=this.t===null?0:(r-this.t)/1e3;this.t=r;let o=ei(e)?nc(e,i.minFloorDb,0):this.floor??i.minFloorDb;this.floor===null?this.floor=o:o<this.floor?this.floor=Math.max(o,this.floor-i.fallDbPerS*s):this.floor=Math.min(o,this.floor+(this.speaking?i.riseDbPerS*.25:i.riseDbPerS)*s),this.floor=nc(this.floor,i.minFloorDb,0);let a=o-this.floor;!this.speaking&&a>=i.onDb&&(this.speaking=!0,this.lastLoud=r),this.speaking&&(a>=i.offDb?this.lastLoud=r:r-this.lastLoud>i.hangoverMs&&(this.speaking=!1));let l=this.speaking?eo((a-i.offDb)/30):0;return{speaking:this.speaking,level:l,floorDb:this.floor}}},CI={aa:[700,1100],ih:[300,2300],ou:[300,800],ee:[500,1800],oh:[500,900]},oE=.25,aE=[200,3200],II=250,PI=25,lE=2;function LI(t,e,n){let i={...Sd(),open:0};if(!t||typeof t=="string"||!ei(t.length)||t.length<8||!ei(e)||e<=0||!ei(n)||n<=0)return i;let r=e/n,s=Math.max(1,Math.ceil(aE[0]/r)),o=Math.min(t.length-2,Math.floor(aE[1]/r));if(o-s<6)return i;let a=b=>{let P=t[b];return ei(P)?nc(P,-140,20):-140},l=new Float64Array(t.length);for(let b=0;b<t.length;b++)l[b]=10**(a(b)/10);let c=new Float64Array(t.length);for(let b=s;b<=o;b++){let P=0,S=0;for(let y=Math.max(0,b-lE);y<=Math.min(t.length-1,b+lE);y++)P+=l[y],S++;c[b]=10*Math.log10(P/S+1e-14)}let u=Array.from(c.subarray(s,o+1)).sort((b,P)=>b-P),h=u[u.length-1],d=u[u.length>>1],f=eo((h-d-6)/24);if(f<=0)return i;let g=[];for(let b=s+1;b<o;b++)if(c[b]>=c[b-1]&&c[b]>c[b+1]&&c[b]>=h-PI){let P=c[b-1],S=c[b],y=c[b+1],L=P-2*S+y,F=L<-1e-9?nc(.5*(P-y)/L,-.5,.5):0;g.push({hz:(b+F)*r,db:S})}if(!g.length)return i;g.sort((b,P)=>P.db-b.db);let _=g[0],m=g.find(b=>Math.abs(b.hz-_.hz)>=II)??_,[p,E]=_.hz<=m.hz?[_.hz,m.hz]:[m.hz,_.hz],T={};for(let b of Ca){let[P,S]=CI[b];T[b]=Math.log2(p/P)**2+Math.log2(E/S)**2}let v=Math.min(...Object.values(T)),C=0,A={};for(let b of Ca)A[b]=Math.exp(-(T[b]-v)/(2*oE*oE)),C+=A[b];for(let b of Ca)i[b]=A[b]/C*f;return i.open=f,i}var Md=class{constructor({attackMs:e=40,releaseMs:n=120,...i}={}){this.attackMs=e,this.releaseMs=n,this.vad=new r0(i),this.state=Sd(),this.t=null}update(e,n){let i=e&&typeof e=="object"?e:{},r=this.vad.update(i.levelDb,n),s=this.vad.t,o=this.t===null?0:Math.max(0,s-this.t);this.t=s;let a=r.speaking?LI(i.freqDb,i.sampleRate,i.fftSize):null,l=.5+.5*r.level;for(let c of Ca){let u=a?eo(a[c]*l):0,h=u>this.state[c]?this.attackMs:this.releaseMs;this.state[c]+=(u-this.state[c])*(o>0?1-Math.exp(-o/h):0),this.state[c]<1e-6&&(this.state[c]=0)}return{...this.state,speaking:r.speaking,level:r.level}}},cE=t=>{let e=Sd();if(t&&typeof t=="object")for(let n of Ca)e[n]=eo(t[n]);return e},Ed=class{constructor({fadeMs:e=150,onConfidence:n=.6,offConfidence:i=.45}={}){this.fadeMs=Math.max(1,e),this.on=n,this.off=i,this.mix=1,this.useTracked=!1,this.t=null,this.last=Sd()}update(e,n,i,r){let s=eo(n),o=!!e&&typeof e=="object";o?!this.useTracked&&s>=this.on?this.useTracked=!0:this.useTracked&&s<this.off&&(this.useTracked=!1):this.useTracked=!1;let a=ei(r)&&(this.t===null||r>=this.t)?r:this.t??0,l=this.t===null?0:a-this.t;this.t=a;let c=this.useTracked?0:1,u=l/this.fadeMs;this.mix=eo(this.mix<c?Math.min(c,this.mix+u):Math.max(c,this.mix-u));let h=o?this.last=cE(e):this.last,d=cE(i),f={};for(let g of Ca)f[g]=eo((1-this.mix)*h[g]+this.mix*d[g]);return f.mix=this.mix,f.source=this.mix<=.001?"tracked":this.mix>=.999?"audio":"mixed",f}},ic=class{constructor({maxAgeMs:e=2e3,maxSize:n=512}={}){this.maxAge=e,this.maxSize=Math.max(1,n),this.items=[]}get size(){return this.items.length}push(e,n){if(!ei(n))return;let i=this.items.length?this.items[this.items.length-1][0]:-1/0,r=Math.max(n,i);for(this.items.push([r,e]);this.items.length>this.maxSize||r-this.items[0][0]>this.maxAge;)this.items.shift()}read(e,n){if(!ei(e)||!ei(n))return;let i=e-Math.max(0,n);for(let r=this.items.length-1;r>=0;r--)if(this.items[r][0]<=i)return this.items[r][1]}},uE=250;function hE(t){let e=t&&typeof t=="object"?t:{},n=ei(e.audioLatencyMs)?Math.max(0,e.audioLatencyMs):0,i=ei(e.videoLatencyMs)?Math.max(0,e.videoLatencyMs):0,r=Math.round(i-n)||0;return{delayAudioMs:r>0?Math.min(r,uE):0,delayVideoMs:r<0?Math.min(-r,uE):0,offsetMs:r}}var sn=new URLSearchParams(location.search),bd=sn.get("mirror")!=="0",Pd=sn.get("track")==="1",SE=Pd&&sn.get("publish")==="1",Td=Pd&&sn.get("preview")==="1",lc=sn.get("view")==="desk",UI=lc?"off":["auto","off","on"].includes(sn.get("legs"))?sn.get("legs"):"auto",NI=["auto","cpu","gpu"].includes(sn.get("delegate"))?sn.get("delegate"):"auto",TE=t=>(sn.get(t)||"").replace(/[\u0000-\u001f]/g,"").slice(0,256)||null,DI=TE("cam"),OI=sn.get("quality"),Ad=TE("mic"),FI=sn.get("badge")!=="off"||sn.get("track")==="1",l0=lc?{dist:1.95,y:.8}:sn.get("frame")==="full"?{dist:2.7,y:.68}:{dist:1.75,y:.86},bE={coral:["#f28573","#333f73"],ocean:["#3a86d1","#1d2b53"],sunny:["#f2c14e","#7a4e1d"],berry:["#b5446e","#3a1c40"],forest:["#3f8f5a","#1f3d2b"]},wE=bE[sn.get("outfit")]?sn.get("outfit"):"coral",AE=(t,e)=>(t||"").replace(/[\u0000-\u001f]/g,"").slice(0,e),dE=AE(sn.get("name"),40),fE=AE(sn.get("tagline"),80),st=window.__realx={outfit:wE,emotes:[],gestures:[],micMuted:!1,connected:!1,modelLoaded:!1,error:null,frames:0,rigMessages:0,pose:null,tracking:null,bodyMessages:0,bodyLive:!1,bodyFlags:null,rejected:0,sent:0,recenter:()=>{}},ti={t:-1/0,quats:null,expr:null,root:[0,0,1],flags:null},pE=Object.fromEntries(Ht.map(t=>[t,new he])),RE=Object.fromEntries(Ht.map(t=>[t,new he])),sc=[0,0,1],c0={},BI=fd(lc),s0=!1,fs=null,Ia=null;function CE(t){let e=KM(t);if(!e){st.rejected++;return}st.bodyMessages++,ti.t=performance.now()/1e3,ti.quats=e.quats,ti.expr=e.expr,ti.root=e.root,ti.flags=e.flags,st.bodyFlags=e.flags;for(let n of Ht)RE[n].set(...e.quats[n])}var kI=document.getElementById("stage"),Rd=new Ju({canvas:kI,alpha:!0,antialias:!0,premultipliedAlpha:!0});Rd.setClearColor(0,0);var d0=new Qa,cc=new $t(30,1,.1,20);cc.position.set(0,l0.y+.05,l0.dist);cc.lookAt(0,l0.y,0);var f0=new Ps(16777215,1.5);f0.position.set(.8,1.2,1.5);var IE=new dl(16777215,1);d0.add(f0,IE);var oc=sn.get("light")==="off"?null:new yd({ambient:IE,sun:f0,sample:null}),mE=null,HI=/^\/avatar\/background\.png\?v=\d{1,9}$/;function VI(t){let e=t&&typeof t.url=="string"&&HI.test(t.url)?t.url:null;if(!oc||e===mE)return;if(mE=e,st.lightUrl=e,!e)return oc.setSample(null);let n=new Image;n.src=e,oc.setSample(sE(n))}function PE(){let t=window.innerWidth,e=window.innerHeight;Rd.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),Rd.setSize(t,e,!1),cc.aspect=t/Math.max(1,e),cc.updateProjectionMatrix()}window.addEventListener("resize",PE);PE();var p0=["x","y","depth","yaw","pitch","roll","smile"],Lr=Object.fromEntries(p0.map(t=>[t,t==="depth"?1:0])),o0={...Lr},LE=-1/0,Cd=!1,gE=null,UE={wave:2.2,happy:1.8,surprised:1.4,bow:1.6},nr=null;function u0(t){UE[t]&&(nr={name:t,start:performance.now()/1e3},st.emotes.push(t))}function zI(t){st.rigMessages++;let e=t.faces&&t.faces[0];if(VI(t.background),ZI(t.mic),t.emote&&t.emote.id!==gE&&(t.emote.age<2.5&&u0(t.emote.name),gE=t.emote.id),!e){Cd=!1;return}Cd=!0,LE=performance.now()/1e3;for(let n of p0){let i=Number(e[n]);Number.isFinite(i)&&(Lr[n]=i)}bd&&(Lr.x=-Lr.x,Lr.yaw=-Lr.yaw,Lr.roll=-Lr.roll)}function NE(t=500){let e=new WebSocket(`ws://${location.host}/ws/rig${SE?"?publish=1":""}`);Ia=e,e.onopen=()=>{st.connected=!0,t=500},e.onmessage=n=>{let i;try{i=JSON.parse(n.data)}catch{return}i.type==="hello"?GI(i.provenance):i.type==="rig"?zI(i):i.type==="body"&&!Pd&&CE(i)},e.onclose=()=>{st.connected=!1,Ia=null,Cd=!1,setTimeout(()=>NE(Math.min(t*2,5e3)),t)},e.onerror=()=>e.close()}function GI(t){let e=document.getElementById("badge");!e||!FI||!t||(e.textContent=t.synthetic?"Virtual character \xB7 "+t.generator:"",e.hidden=!t.synthetic)}(function(){let e=document.getElementById("lower");!e||!dE&&!fE||(e.querySelector("b").textContent=dE,e.querySelector("span").textContent=fE,e.hidden=!1)})();var ir=null,DE=new eh;DE.register(t=>new Cx(t));DE.load("/avatar/model.vrm",t=>{if(ir=t.userData.vrm,!ir){st.error="file is not a VRM model";return}WI(ir),d0.add(ir.scene),st.modelLoaded=!0,Pd&&XI().catch(e=>{st.error=String(e&&e.message||e),st.tracking={...st.tracking||{},state:"error",detail:st.error}})},void 0,t=>{st.error=String(t&&t.message||t)});function WI(t){let[e,n]=bE[wE];t.scene.traverse(i=>{if(i.isMesh)for(let r of[].concat(i.material)){let s=r.name==="outfit"?e:r.name==="accent"?n:null;!s||!r.color||(r.color.set(s),r.shadeColorFactor&&r.shadeColorFactor.set(s).multiplyScalar(.72))}})}var Ld=t=>ir?ir.humanoid.getNormalizedBoneNode(t):null;async function XI(){let t=document.getElementById("cam"),e=document.getElementById("trackstate"),n=0;Td&&t&&(t.hidden=!1,bd&&t.classList.add("mirror"));let i=(o,a)=>{st.tracking={...st.tracking||{},state:o,detail:a},e&&Td&&(e.hidden=o==="running",e.textContent=o==="error"?a:`Camera: ${o}\u2026`)},r=Dx(o=>{let a=Ld(o);return a?a.position.clone():null}),s=new ph(r,{mirror:bd,upperBody:lc});fs=await eE({solver:s,mirror:bd,legs:UI,desk:lc,delegate:NI,video:Td?t:null,deviceId:DI,quality:OI,onStatus:i,onHands:(o,a)=>{let l=OE.feed(o,a);l&&$I(l)},onFrame:(o,a)=>{st.tracking={...st.tracking,frames:a.frames,fps:Math.round(a.fps),ms:a.ms,hz:a.hz,diag:a.diag,delegates:a.delegates},JI(o,a.latencyMs,performance.now(),a.mouthCover),CE(o);let l=performance.now();if(Td&&e&&a.diag&&l-n>400){n=l;let c=a.diag,u=h=>h?"yes":"no";e.hidden=!1,e.textContent=`body: ${u(c.pose)} \xB7 face: ${u(c.face)} \xB7 hands: ${c.handHint} \xB7 mic: ${Ur?Ur.speaking?"speaking":"quiet":Ad?st.micError?"unavailable":"starting":"off"} \xB7 updates/s pose ${a.hz.pose}, face ${a.hz.face}, hands ${a.hz.hands}`}SE&&Ia&&Ia.readyState===WebSocket.OPEN&&Ia.bufferedAmount<65536&&(Ia.send(JSON.stringify(o)),st.sent++)}}),st.recenter=()=>fs.recenter(),yE(),navigator.mediaDevices?.addEventListener?.("devicechange",yE),Ad&&jI(),setInterval(()=>m0(QM({info:fs.stats(),state:st.tracking?.state,detail:st.tracking?.detail,mic:Ur,avSyncMs:BE})),500)}var wd=["aa","ih","ou","ee","oh"],a0=Object.fromEntries(wd.map(t=>[t,$r.indexOf(t)])),qI=new Md,YI=new Ed,_E=new ic,vE=new ic,OE=new xd,Id=!1;function FE(t){if(Id=t,ds)for(let e of ds.tracks||[])e.enabled=!t;st.micMuted=t}function $I({gesture:t,action:e}){e==="toggle-mic"?FE(!Id):e==="emote-happy"?u0("happy"):e==="emote-wave"?u0("wave"):e==="recenter"&&(fs&&fs.recenter(),nr=null),st.gestures.push(t),m0({type:"realx-gesture",gesture:t,action:e,micMuted:Id})}var ds=null,Ur=null,ac={aa:0,ih:0,ou:0,ee:0,oh:0,speaking:!1,level:0},BE=null;async function jI(){await new Ra({kind:"microphone",explain:e=>String(e&&e.message||"The microphone is not available.").slice(0,140),start:async()=>{let e=await iE({deviceId:Ad==="default"?void 0:Ad,onFeatures:n=>{ac=zM(qI.update(n,n.t),n.levelDb),Ur={active:!0,speaking:ac.speaking,levelDb:n.levelDb,latencyMs:ds?ds.latencyMs:null},st.mic=Ur}});if(ds=e,Id)for(let n of e.tracks||[])n.enabled=!1;return Ur={active:!0,speaking:!1,levelDb:null,latencyMs:e.latencyMs},st.mic=Ur,st.micError=null,e},onState:e=>{(e.state==="lost"||e.state==="blocked")&&(ds=null,Ur=null,st.mic=null,st.micError=e.message)}}).run()}var xE=!1;function ZI(t){let e=!!(t&&t.muted===!0);e!==xE&&(xE=e,FE(e))}var KI=new hd;function JI(t,e,n,i=0){if(!ds||!Ur)return;let r=Object.fromEntries(wd.map(l=>[l,t.e[a0[l]]])),s=hE({audioLatencyMs:ds.latencyMs,videoLatencyMs:Number.isFinite(e)?e:0});_E.push(r,n),vE.push(ac,n);let o=KI.update({faceSeen:e0(t.f,"face"),cover:i,trackedAa:r.aa,audio:ac},n),a=YI.update(_E.read(n,s.delayVideoMs)??r,o,vE.read(n,s.delayAudioMs)??ac,n);for(let l of wd)t.e[a0[l]]=Math.round(Math.min(1,Math.max(0,a[l]))*1e3)/1e3;st.mouth={...Object.fromEntries(wd.map(l=>[l,t.e[a0[l]]])),source:a.source,confidence:Math.round(o*100)/100},BE=Number.isFinite(e)?s.offsetMs:null}function m0(t){window.parent!==window&&window.parent.postMessage(t,location.origin)}async function yE(){if(!(window.parent===window||!navigator.mediaDevices?.enumerateDevices))try{let t=await navigator.mediaDevices.enumerateDevices(),e=n=>t.filter(i=>i.kind===n&&i.deviceId).slice(0,20).map(i=>({id:String(i.deviceId).slice(0,256),label:String(i.label||"").replace(/[\u0000-\u001f]/g,"").slice(0,100)}));m0({type:"realx-devices",cameras:e("videoinput"),mics:e("audioinput")})}catch{}}window.addEventListener("message",t=>{t.origin!==location.origin||!t.data||!fs||(t.data.type==="realx-recenter"?fs.recenter():t.data.type==="realx-gestures"?OE.setEnabled(t.data.enabled===!0):t.data.type==="realx-legs"&&["auto","off","on"].includes(t.data.mode)&&fs.setLegs(t.data.mode))});var h0=(t,e,n,i)=>t+(e-t)*(1-Math.exp(-n/i)),ME=2.5,rc=-1;function QI(t){if(rc<0&&t>=ME&&(rc=t),rc<0)return 0;let e=(t-rc)/.16;return e>=1?(rc=-1,ME=t+2+Math.random()*3.5,0):1-Math.abs(2*e-1)}function eP(t,e){let n=t-LE,i=Cd&&n<.6;for(let g of p0){let _=i?Lr[g]:g==="depth"?1:0;o0[g]=h0(o0[g],_,e,i?.05:.5)}let r=o0,s=(g,_,m)=>Math.min(m,Math.max(_,g)),o=(g,_,m,p)=>{let E=Ld(g);E&&E.rotation.set(_,m,p,"YXZ")},a=ti.quats!==null&&t-ti.t<.6;st.bodyLive=a;let l=Math.sin(t*1.7);a?tP(e,!s0):(s0&&nP(),o("head",-r.pitch*.6,r.yaw*.6,-r.roll*.65),o("neck",-r.pitch*.4,r.yaw*.4,-r.roll*.35),o("chest",.015*l+s(r.depth-1,-.5,.5)*.25,r.yaw*.12,-r.x*.12),o("spine",0,r.yaw*.08,-r.x*.1),o("leftUpperArm",0,0,-1.15+.02*l),o("rightUpperArm",0,0,1.15-.02*l),o("leftLowerArm",0,.1,.12),o("rightLowerArm",0,-.1,-.12)),s0=a;let c=0,u=0,h=0,d=0;if(nr){let g=(t-nr.start)/UE[nr.name];if(g>=1)nr=null;else{let _=Math.sin(Math.PI*g);nr.name==="wave"?(o("rightUpperArm",0,0,1.15-_*2.25),o("rightLowerArm",0,-.1,-.12-_*(.45+.35*Math.sin(t*15))),u=.6*_):nr.name==="happy"?(c=Math.abs(Math.sin(t*9))*.06*_,u=_,o("leftUpperArm",0,0,-1.15+_*.5),o("rightUpperArm",0,0,1.15-_*.5)):nr.name==="surprised"?(h=.85*_,d=_,c=.04*_,o("head",-r.pitch*.6-.18*_,r.yaw*.6,-r.roll*.65)):nr.name==="bow"&&(o("spine",.55*_,0,0),o("neck",.25*_,0,0),u=.5*_)}}let f=a?{x:sc[0],y:sc[1],depth:sc[2]}:r;ir.scene.position.set(s(f.x,-1.2,1.2)*.28,-s(f.y,-1,1)*.12+c,s((f.depth-1)*.5,-.4,.4)),tE(ir.expressionManager,c0,{live:a,faceSeen:!!(ti.flags&&ti.flags.face),idleBlink:QI(t),smile:r.smile,boost:{happy:u,oh:h,surprised:d}}),st.pose={...r,live:i||a}}function tP(t,e){let n=e?1:1-Math.exp(-t/.035);for(let i of Ht){pE[i].slerp(RE[i],n);let r=Ld(i);r&&r.quaternion.copy(pE[i])}for(let i=0;i<3;i++)sc[i]=e?ti.root[i]:h0(sc[i],ti.root[i],t,.08);for(let[i,r]of Object.entries(ti.expr))c0[i]=e?r:h0(c0[i]??r,r,t,.03)}function nP(){let t=new Set(["head","neck","chest","spine","leftUpperArm","rightUpperArm","leftLowerArm","rightLowerArm"]);for(let e of Ht){let n=Ld(e);n&&!t.has(e)&&n.quaternion.copy(BI[e])}ti.quats=null}var EE=performance.now()/1e3;function kE(){requestAnimationFrame(kE);let t=performance.now()/1e3,e=Math.min(.1,Math.max(.001,t-EE));EE=t,ir&&(eP(t,e),ir.update(e)),oc&&oc.update(performance.now(),e),Rd.render(d0,cc),st.frames++}requestAnimationFrame(kE);NE();})();
