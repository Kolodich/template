// !!---------------- Methods ----------------!!
// css          - compile *.scss to style.css with sourcemap
// js           - compile  *.js to sciprt.css with sourcemap
// minfy_css    - comprese style.css file to style.min.css
// min_js       - comprese script.js file to script.min.js
// minfy_img    - comprase SVG, GIF, PNG, JPG (JPEG) images to name.min.*
// include_html - include HTML pieces into HTML file
// create_block - filling in the block when renaming it
// watch        - watching files
// server       - create local server
// deploy       - deploy project

const gulp = require("gulp");

const sync = require('browser-sync').create();

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const min_css = require('gulp-clean-css');
const min_js = require('gulp-jsmin');
const min_img = require('gulp-image');

const rename = require("gulp-rename");
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const fileinclude = require('gulp-file-include');

const fs = require('fs');
const del = require('del');
const clean = require('gulp-clean');

const base_dir = "./work/";
const deploy_dir = "./deploy/";


const css = () => {
 return gulp.src(base_dir+"blocks/main.scss")
 .pipe(sourcemaps.init())
 .pipe(sass({
  errorLogToConsole: true,
 }))
 .on("error", console.error.bind(console))
 .pipe(autoprefixer({
  overrideBrowserslist:  ['last 10 versions'],
  cascade: false
 }))   
 .pipe(sourcemaps.write())
 .pipe(rename((path)=>{
  path.basename = "style";
  path.extname = ".css";
 }))
 .pipe(gulp.dest(base_dir+"css/"))
 .pipe(sync.stream());
}
exports.css = css;

const minfy_css = () =>{
  return gulp.src(base_dir+"css/style.css")
  .pipe(min_css({compatibility: 'ie8'}))
  .pipe(rename({suffix: ".min"}))
  .pipe(gulp.dest(base_dir+"css/"))
  .pipe(sync.stream());
}
exports.minfy_css = minfy_css;

const js = () => {
 return gulp.src(base_dir+"blocks/**/*.js")
 .pipe(sourcemaps.init())
 .pipe(concat('script.js'))
 .on("error", console.error.bind(console))
 .pipe(sourcemaps.write())
 .pipe(gulp.dest(base_dir+"js/"))
 .pipe(sync.stream());
}
exports.js = js;

const minfy_js = () =>{
 return gulp.src(base_dir+"js/script.js")
  .pipe(min_js())
  .pipe(rename({suffix: ".min"}))
  .pipe(gulp.dest(base_dir+"js/"))
  .pipe(sync.stream());
}
exports.minfy_js = minfy_js;

const minfy_img = (done) =>{
 gulp.src(base_dir+'img/**/*[!.min].*(svg|png|gif|jpg|jpeg)')
   .pipe(min_img({
    pngquant: true,
    optipng: true,
    zopflipng: true,
    jpegRecompress: false,
    mozjpeg: true,
    gifsicle: true,
    svgo: true,
    concurrent: 10,
    quiet: true // defaults to false
  }))
   .pipe(clean({force: true}))
   .pipe(rename({suffix: ".min"}))
   .pipe(gulp.dest(base_dir+"img/"))
   .pipe(sync.stream());
 done();
}
exports.minfy_img = minfy_img;

const include_html = (done) =>{
  // Including from _*.html (no _start/_end.html) to *.html
  gulp.src(base_dir+'_!(end|start)*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .on("error", console.error.bind(console))
    .pipe(rename(function(path){
      path.basename = path.basename.replace("_", "");
    }))
    .pipe(gulp.dest(base_dir+''))
    .pipe(sync.stream());
  done();
}
exports.include_html = include_html;

const create_block = (done) =>{
  let all_blocks = base_dir+'blocks';
  let dirs = fs.readdirSync(all_blocks); // get a list of child directories   
  
  dirs.forEach((elem, index) => {
    if(dirs[index].indexOf(".html")>=0 || dirs[index].indexOf(".js")>=0 || dirs[index].indexOf(".scss")>=0 || dirs[index].indexOf(".css")>=0 || dirs[index].indexOf(".sass")>=0)
    {
      delete dirs[index];
    } 
  });

  dirs = dirs.filter(function (el) {return el != null;}); // remoove empty files
  let date = new Date()
  for(i = 0; i < dirs.length;i++){
    if(fs.existsSync(all_blocks+'/'+dirs[i]+'/_'+dirs[i]+'.html') === false && fs.existsSync(all_blocks+'/_'+dirs[i]+'/_'  +dirs[i]+'.sass') === false && fs.existsSync(all_blocks+'/_'+dirs[i]+'/'+dirs[i]+'.js') === false)
    { 
      fs.appendFileSync(all_blocks+'/'+dirs[i]+'/_'+dirs[i]+'.html', ''); // _block_name.pug
      fs.appendFileSync(all_blocks+'/'+dirs[i]+'/_'+dirs[i]+'.js', '');   // _block_name.js
      fs.appendFileSync(all_blocks+'/'+dirs[i]+'/_'+dirs[i]+'.scss', ''); // _block_name.sass 
      console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" files were sucessfully added to "+base_dir+"blocks/"+dirs[i]);
    }
  }
  done();
}
exports.create_block =create_block;

const server = (done) => {
  sync.init({
   server:{
    baseDir: base_dir+"",
    index: "index.html"
   },
   port: 3000
  });
  done(); 
}
exports.server = server;

const deploy = (done) =>{
  del.sync(deploy_dir);

  const date = new Date();

  gulp.src(base_dir+".htaccess")  
  .pipe(gulp.dest(deploy_dir+""));
  console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" .htacces ready");

  gulp.src(base_dir+"[!_]*.html")
  .pipe(gulp.dest(deploy_dir));
  console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" HTML files ready");

  gulp.src(base_dir+"css/**/*.css")  
  .pipe(gulp.dest(deploy_dir+"css/"));
  console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" CSS files ready");

  gulp.src(base_dir+"js/**/*.js")
  .pipe(gulp.dest(deploy_dir+"js/"));
  console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" JS files ready");

  gulp.src(base_dir+"img/**/*.*(svg|png|jpg|jpeg|gif)")  
  .pipe(gulp.dest(deploy_dir+"img/"));
  console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" image files ready");
  
  gulp.src(base_dir+"video/**/*.*") 
  .pipe(gulp.dest(deploy_dir+"video/"));
  console.log("["+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]"+" video files ready");
  
  done();
}
exports.deploy = gulp.series(gulp.parallel(gulp.series(css, minfy_css), gulp.series(js, minfy_js), minfy_img, include_html), deploy);

const watch = () => {
 gulp.watch([base_dir+"blocks/**/_*.scss", base_dir+"blocks/main.scss"], gulp.series(css, minfy_css));
 gulp.watch([base_dir+"blocks/**/_*.js", base_dir+"blocks/main.js"], gulp.series(js, minfy_js));
 gulp.watch([base_dir+"_*.html", base_dir+"blocks/**/_*.html"], include_html);
 gulp.watch(base_dir+"img/**/*[!.min].*(png|svg|gif|jpg|jpeg)", minfy_img);
 gulp.watch(base_dir+"blocks/*").on('addDir', create_block);
}
exports.watch = watch;

exports.default = gulp.series(
  gulp.parallel(gulp.series(css, minfy_css), gulp.series(js, minfy_js), minfy_img, create_block, include_html),
  gulp.parallel(server, watch)
);