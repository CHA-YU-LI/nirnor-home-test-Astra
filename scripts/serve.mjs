import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();const port=Number(process.env.PORT||8081);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.scss':'text/plain; charset=utf-8','.webm':'video/webm','.zip':'application/zip'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if(pathname.split('/').some(p=>p.startsWith('.')&&p!=='')){res.writeHead(403);res.end();return;}
    let stat=await fs.stat(file);if(stat.isDirectory()){file=path.join(file,'index.html');stat=await fs.stat(file);}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    const data=await fs.readFile(file);const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),data.length-1):data.length-1;if(start>end){res.writeHead(416);res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
    else {res.writeHead(200,{'Content-Length':data.length});res.end(data);}
  } catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('找不到檔案');}
}).listen(port,'127.0.0.1',()=>console.log(`特效庫：http://127.0.0.1:${port}/library.html`));
