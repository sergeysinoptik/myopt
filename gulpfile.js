import gulp from 'gulp'; // Подключаем Gulp
import fs from 'fs';
import dartSass from 'sass';
import gulpSass from 'gulp-sass'; // Подключаем Sass
import bulk from 'gulp-sass-bulk-importer';
import autoprefixer from 'gulp-autoprefixer'; // Подключаем библиотеку для автоматического добавления префиксов
import concat from 'gulp-concat'; // Подключаем пакет для конкатенации файлов
import clean from 'gulp-clean-css';
import map from 'gulp-sourcemaps';
import browserSync from 'browser-sync'; // Подключаем Browser Sync
import uglify from 'gulp-uglifyjs'; // Подключаем пакет для сжатия JS
import cssnano from 'gulp-cssnano'; // Подключаем пакет для минификации CSS
import rename from 'gulp-rename'; // Подключаем библиотеку для переименования файлов
import del from 'del'; // Подключаем библиотеку для удаления файлов и папок
import imagemin from 'gulp-imagemin'; // Подключаем библиотеку для работы с изображениями
import pngquant from 'imagemin-pngquant'; // Подключаем библиотеку для работы с png
import cache from 'gulp-cache'; // Подключаем библиотеку кеширования
import babel from 'gulp-babel';
import include from 'gulp-file-include';
import changed from 'gulp-changed';
import recompress from 'imagemin-jpeg-recompress';
import plumber from 'gulp-plumber';
import webpConv from 'gulp-webp';
import multiDest from 'gulp-multi-dest';
import svgmin from 'gulp-svgmin';
import svgCss from 'gulp-svg-css-pseudo';
import sprite from 'gulp-svg-sprite';
import ttf2woff2 from 'gulp-ttftowoff2';
import ttf2woff from 'gulp-ttf2woff';
import chalk from 'chalk'; // Раскрашиваем консоль при ошибке

const {
  src, dest, parallel, series, watch,
} = gulp;

const sass = gulpSass(dartSass);

// Тестирование GULP
gulp.task('hello', () => {
  console.log('Hello Gulp');
});

// Browser Sync
gulp.task('browser-sync', () => {
  browserSync({ // Выполняем browser Sync
    server: { // Определяем параметры сервера
      baseDir: 'dist', // Директория для сервера - app
    },
    notify: false,
    online: true, // Отключаем уведомления
  });
});

// Компиляция всех файлов SCSS в CSS
gulp.task('sass', () => src(['app/scss/**/*.scss', '!app/scss/libs.scss']) // выбираем папку
  .pipe(map.init()) // Инициализировать карту исходных файлов (sourcemaps)
  .pipe(bulk()) // чтобы scss-файлы можно было импортировать не по одному, а целыми директориями
  .pipe(sass({
    outputStyle: 'compressed',
  }).on('error', sass.logError)) // компилируем
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
  .pipe(clean({
    level: 2,
  })) // Очистить от лишнего
  .pipe(concat('style.min.css')) // Склеить в единый файл style.css
  .pipe(map.write('../sourcemaps/')) // Записать карту исходных файлов в получившемся файле
  .pipe(dest('dist/css')) // выгружаем в прод
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

// Минификация библиотек CSS
gulp.task('css-libs', () => src('app/scss/libs.scss') // Выбираем файл для минификации. Предварительно устанавливаем библиотеки с помощью bower и импортируем нужное в файл libs.scss. Например 'bower i jquery'
  .pipe(map.init())
  .pipe(sass({
    outputStyle: 'compressed',
  }).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
  .pipe(cssnano()) // Сжимаем
  .pipe(rename({ suffix: '.min' })) // Добавляем суффикс .min
  .pipe(map.write('../sourcemaps/'))
  .pipe(dest('dist/css')) // Выгружаем в прод
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

// Обработка файлов JS - delete
gulp.task('scripts', () => src(['app/js/common.js', 'app/libs/**/*.js']) // собираем файлы для отслеживания
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

// Обработка библиотек JS - delete
gulp.task('libs', () => src([ // Берем все необходимые библиотеки
  'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
  'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js', // Берем Magnific Popup
])
  .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле
  .pipe(uglify()) // Сжимаем JS файл
  .pipe(dest('app/js'))); // Выгружаем в папку

gulp.task('devJs', () => src([
  'app/components/**/*.js',
  'app/js/01_main.js',
])
  .pipe(map.init())
  .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(map.write('../sourcemaps'))
  .pipe(dest('dist/js/'))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

gulp.task('libJs', () => src([ // Берем все необходимые библиотеки
  'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
  'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js', // Берем Magnific Popup
])
  .pipe(map.init())
  .pipe(uglify())
  .pipe(concat('libs.min.js'))
  .pipe(map.write('../sourcemaps'))
  .pipe(dest('dist/js/'))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

gulp.task('buildJs', () => src([
  'app/components/**/*.js',
  'app/js/01_main.js',
])
  .pipe(uglify())
  .pipe(babel({
    presets: ['@babel/env'],
  }))
  .pipe(concat('main.min.js'))
  .pipe(dest('dist/js/'))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

// Обработка HTML
gulp.task('html', () => src(['app/**/*.html', '!app/components/**/*.html']) // собираем файлы для отслеживания
  .pipe(include())
  .pipe(dest('dist'))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

// Обработка PHP
gulp.task('php', () => src('app/**/*.php')
  .pipe(include())
  .pipe(dest('dist'))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

// Обработка растровых изображений - delete
gulp.task('img', () => src('app/img/**/*') // Берем все изображения из app
  .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками с учетом кеширования
    interlaced: true,
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    use: [pngquant()],
  })))
  .pipe(dest('dist/img'))); // Выгружаем в продакшен

gulp.task('rastr', () => src('app/img/**/*.+(png|jpg|jpeg|gif|svg|ico)')
  .pipe(plumber())
  .pipe(changed('dist/img'))
  .pipe(imagemin(
    {
      interlaced: true,
      progressive: true,
      optimizationLevel: 5,
    },
    [
      recompress({
        loops: 6,
        min: 50,
        max: 90,
        quality: 'high',
        use: [pngquant({
          quality: [0.8, 1],
          strip: true,
          speed: 1,
        })],
      }),
      // imagemin.gifsicle(),
      // imagemin.optipng(),
      // imagemin.svgo(),
    ],
  ))
  .pipe(dest('dist/img'))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

gulp.task('webp', () => src('dist/img/**/*.+(png|jpg|jpeg)')
  .pipe(plumber())
  .pipe(changed('dist/img', {
    extension: '.webp',
  }))
  .pipe(webpConv())
  .pipe(multiDest(['app/img', 'dist/img']))
  .pipe(browserSync.reload({ stream: true }))); // обновляем браузер

gulp.task('svgcss', () => src('app/svg/css/**/*.svg')
  .pipe(svgmin({
    plugins: [{
      removeComments: true,
    },
    {
      removeEmptyContainers: true,
    },
    ],
  }))
  .pipe(svgCss({
    fileName: '_svg',
    fileExt: 'scss',
    cssPrefix: '--svg__',
    addSize: false,
  }))
  .pipe(dest('app/scss/global')));

gulp.task('svgsprite', () => src('app/svg/**/*.svg') // More: https://habr.com/ru/post/560894/
  .pipe(svgmin({
    plugins: [{
      removeComments: true,
    },
    {
      removeEmptyContainers: true,
    },
    ],
  }))
  .pipe(sprite({
    mode: {
      stack: {
        sprite: '../sprite.svg',
      },
    },
  }))
  .pipe(dest('app/img')));

gulp.task('ttf', (done) => {
  src('app/fonts/**/*.ttf')
    .pipe(changed('dest/fonts', {
      extension: '.woff2',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(ttf2woff2())
    .pipe(dest('dest/fonts'));

  src('app/fonts/**/*.ttf')
    .pipe(changed('dist/fonts', {
      extension: 'woff',
      hasChanged: changed.compareLastModifiedTime
    }))
    .pipe(ttf2woff())
    .pipe(dest('dist/fonts'));

  done();
});

let srcFonts = 'src/scss/_local-fonts.scss';
let appFonts = 'build/fonts/';

gulp.task('fonts', (done) => { // https://habr.com/ru/post/560894/
  fs.writeFile(srcFonts, '', () => {});
  fs.readdir(appFonts, (err, items) => {
    if (items) {
      let cFontname;
      for (let i = 0; i < items.length; i += 1) {
        let fontname = items[i].split('.');
        let fontExt;
        fontExt = fontname[1];
        fontname = fontname[0];
        if (cFontname !== fontname) {
          if (fontExt === 'woff' || fontExt === 'woff2') {
            fs.appendFile(srcFonts, `@include font-face("${fontname}", "${fontname}", 400);\r\n`, () => {});
            console.log(chalk`
{bold {bgGray Added new font: ${fontname}.}
----------------------------------------------------------------------------------
{bgYellow.black Please, move mixin call from {cyan src/scss/_local-fonts.scss} to {cyan src/scss/_fonts.scss} and then change it!}}
----------------------------------------------------------------------------------
`);
          }
        }
        cFontname = fontname;
      }
    }
  });
  done();
});

// Следим за изменениями в файлах и запускаем соответствующую задачу при каждом изменении
gulp.task('watch', () => {
  watch('app/**/*.html', parallel('html')); // Наблюдение за HTML
  watch('app/**/*.php', parallel('php')); // Наблюдение за PHP
  watch('app/**/*.scss', parallel('sass', 'css-libs')); // Наблюдение за CSS
  watch('app/**/*.js', parallel('libJs', 'devJs')); // Наблюдение за JS
  watch('app/**/*.json', parallel('html'));
  watch('app/img/**/*.+(png|jpg|jpeg|gif|svg|ico)', parallel('rastr'));
  watch('dist/img/**/*.+(png|jpg|jpeg)', parallel('webp'));
  watch('app/svg/css/**/*.svg', series('svgcss', 'sass'));
  watch('app/svg/sprite/**/*.svg', series('svgsprite', 'rastr'));
  watch('app/fonts/**/*.ttf', series('ttf', 'fonts'));
});

// Удаляем папку dist перед сборкой
gulp.task('clean', async () => del.sync('dist/**/*'));

// Подзадачи сборки
// gulp.task('buildCss', series('css-libs', 'sass'));

// gulp.task('buildFonts', () => src('app/fonts/**/*') // Переносим шрифты в продакшен
//  .pipe(dest('dist/fonts')));

// gulp.task('buildJs', () => src('app/js/**/*') // Переносим скрипты в продакшен
//  .pipe(dest('dist/js')));

// Сборка проекта
gulp.task('build', parallel('clean', 'css-libs', 'sass', 'libJs', 'buildJs', 'rastr', 'webp', 'svgcss', 'svgsprite', 'ttf', 'fonts', 'html'));

gulp.task('predef', series('css-libs', 'sass', 'libJs', 'devJs', 'rastr', 'webp', 'svgcss', 'svgsprite', 'ttf', 'fonts', 'html', 'browser-sync'));

// Запуск по дефолту 'gulp'
gulp.task('default', parallel('predef', 'watch'));

// Очистить кэш GULP
gulp.task('clear', () => cache.clearAll());
