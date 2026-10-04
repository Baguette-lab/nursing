import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('.',import.meta.url));
const port=Number(process.env.PORT||5500);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.pdf':'application/pdf'};
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be a number from 1 to 65535.');

const server=http.createServer(async(req,res)=>{
 const reply=(status,message)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(message);};
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return reply(405,'Method not allowed.');}
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return reply(400,'Invalid request.');}
 if(pathname==='/'||pathname.endsWith('/'))pathname+='index.html';
 const filename=path.resolve(root,'.'+pathname);
 const relative=path.relative(root,filename);
 if(relative.startsWith('..')||path.isAbsolute(relative)||pathname.includes('\0'))return reply(403,'Access denied.');
 const mime=types[path.extname(filename)];
 if(!mime)return reply(404,'File not found.');
 try{
  const info=await stat(filename);
  if(!info.isFile())return reply(404,'File not found.');
  res.writeHead(200,{'Content-Type':mime,'Content-Length':info.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')return res.end();
  const stream=createReadStream(filename);
  stream.on('error',()=>res.destroy());
  stream.pipe(res);
 }catch{return reply(404,'File not found.');}
});
server.on('error',err=>{
 console.error(err.code==='EADDRINUSE'?`Port ${port} is busy. Close the other server or choose another PORT.`:err.message);
 process.exitCode=1;
});
server.listen(port,'127.0.0.1',()=>{
 console.log(`Pathwise is ready at http://localhost:${port}`);
 console.log('Keep this terminal open while studying. Press Ctrl+C to stop.');
});
