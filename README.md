[Grunt][grunt] plugin for automating resource versioning based on the MD5 hash of referenced files (works on CSS, HTML, SOYs)

## Getting Started

Install this grunt plugin next to your project's gruntfile with: `npm install grunt-rev-md5`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-rev-md5');
```

Then specify your config:

```javascript
    grunt.initConfig({
        revmd5: {
            dist: {
                /** @required  - string (or array of) including grunt glob variables */
                src: ['./static/*.html', './static/*.css', './static/*.soy'],
                /** @optional  - if provided a copy will be stored without modifying original file */
                dest: './dist/static/',
                /** @required - base file system path for your resources (which MD5 will be calculated) */
                relativePath: './',
                /** @optional - when provided if a resource isn't found will fail with a warning */
                safe: true
            }
        }
    });
```
### Notes about path location

There are two types of path resolution that this task do: relative and absolute.

- __Relative__. Imagine that you're referencing the file `image1.png` from `styles.css` which is
stored on `/static/home/css` in this way:

```css
    background: url('../image1.png')
```

In this case our grunt task will go to css path and combine its path (the css) with the relative
path resulting in `/static/home/image1.png'. This looks as the most comprehensive behavior in
this case.

- __Absolute__. Imagine that you're referencing the file `image2.png` from `styles.css` and you've
set the `relativePath` to be `./public`

```css
    background: url('/static/images/image2.png')
```

In this case our grunt task will go to the `relativePath` and combine it with the resource path
resulting in `./public/static/images/image2.png'.

**NOTE**: We consider paths starting with . (or ..) as relative, and with / absolute. We're using
the same aproach as the *NIX file-system.

## Release History
* 0.1.0 Initial Release

[grunt]: https://github.com/cowboy/grunt
