var restify = require('restify');
var Xray = require('x-ray');
var x = Xray({
    filters: {
        trim: function (value) {
            return typeof value === 'string' ? value.trim() : value
        },
        split: function (value) {
            let a = value.split(' of ');
            let b = {
                first:1,
                current: parseInt(a[0]),
                last: parseInt(a[1])
            }
            return b
        },
        url: function (value) {
            return typeof value === 'string' ? value.replace("https://m.gsmarena.com/", "") : value
        },
        urla: function (value) {
            return typeof value === 'string' ? value.replace("https:///", "") : value
        },
        urlG: function(val){
            // if val
            return typeof val === 'string' ?val.replace('https://www.gsmarena.com/',''):val
        },
        mirror: function (value, uri) {
            return uri + value
        },
        pisah: function (value) {
            let a = value.split(':');
            b = a[1];
            return b.trim()
        },
        slash: function (value) {            
            return value.replace('\\"','')
        }
    }
});

var baseUrl = "https://m.gsmarena.com/";
const server = restify.createServer({
    
    // formatters: {
    //     'application/json': function(req, res, body, cb) {
    //         return cb(null, JSON.stringify(body, null, '\t'));
    //     }
    // },
    name: 'phone-arena-api',
    version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


// Get Homepage
server.get('/', function (req, res, next) {

    x(baseUrl + "/", "#content", {
        news:x('.homepage-news-list .homepage-slide',[{
            img:"img@src",
            title:"a h3",
            url: "a@href | url"
        }]),
        reviews:{
            different:{
                title:"div.ltst.homepage-slide-review > div > h3 > a",
                img:"div.ltst.homepage-slide-review > div > a > img@src",
                url:"div.ltst.homepage-slide-review > div > h3 > a@href | url",
                desc:"div.ltst.homepage-slide-review > p"
            },
            list:x(' div.homepage-slide-review.swiper-slide a',[{
                img:"img@src",
                url:"@href | url",
                title:"h3",


            }]),
        },
        latest:x(' #latest-container > div.scroller-phones.swiper-wrapper > div.swiper-slide div',[{
            img:"img@src",
            url:"a@href | url | urla",
            title:"a",
        }]),
        instore:x(' #instores-container > div.scroller-phones.swiper-wrapper > div.swiper-slide > div',[{
            img:"img@src",
            url:"a@href | url | urla",
            title:"a",
        }]),
        brands:x('.general-menu.material-card > ul > li',[{
            url:" a@href |url",
            title:" a",
            // url:" a@href",
        }])
        
    }).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});
// News list
server.get('/news', function (req, res, next) {
	let uri = baseUrl+'news.php3?iPage='+req.query.page;
	//console.log(uri);
    x(uri, "#content", {
        news:x('.news-item',[{
            title:"a h2",
            img:"a img@src",
            url:"a@href |url",
            date:".sub-hl"
        }]),
        page:'#nav-review-page > div > div > span | split'     
    }).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});


// News detail
server.get('/news/:url', function (req, res, next) {

    x(baseUrl+req.params.url, "#content", {
        title:"h1",
        date:"sub-h1",
        content:"#review-body@html |trim |slash",
        related:x('.homepage-slide',[
            {
                title:"a h3",
                img:"a img@src",
                url: "a@href |url"

            }
        ])
      
        // page:'#nav-review-page > div > div > span | split'     
    }).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});
// Reviews
server.get('/reviews', function (req, res, next) {
	var uri = baseUrl+'reviews.php3?iPage='+req.query.page;
    x(uri, "#content", {
        news:x('.reviews-item',[{
            title:"a h2",
            img:"a img@src",
            url:"a@href | url",
            date:".sub-hl"
        }]),
        page:'#nav-review-page > div > div > span | split'     
    }).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});

server.get('/brands', function (req, res, next) {

    x(baseUrl+'makers.php3' + "/", "#list-brands li", 
        [
            {
                brand:"a",
                url:"a@href | url",

            }
        ],
        // page:'#nav-review-page > div > div > span | split'     
    ).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});

server.get('/phones/list/:url', function (req, res, next) {
    
    x('https://www.gsmarena.com/'+req.params.url , "#main", {
        phones:x('div.makers > ul > li',[{
            title:"a",
            img:"a img@src",
            url:"a@href |urlG",
           
        }]),
        page:x('.pages-next-prev',{
            next:"a.pages-next@href |urlG"
        })     
    }).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});

server.get('/phones/detail/:url', function (req, res, next) {
    
    x(baseUrl+req.params.url , "#container", {
        title:"h1",        
        img:"#specs-cp-pic > div > div > a > img@src",       
        youtube:"div.module.module-vid-review.material-card > iframe@src",
        quick_spec:{
            display_size: 'span[data-spec=displaysize-hl]',
            display_res: 'span[data-spec=displayres-hl]',
            camera_pixels: 'span[data-spec=camerapixels-hl]',
            video_pixels: 'span[data-spec=videopixels-hl]',
            ram_size: 'span[data-spec=ramsize-hl]',
            chipset: 'span[data-spec=chipset-hl]',
            battery_size: 'span[data-spec=batsize-hl]',
            battery_type: 'span[data-spec=battype-hl]'
        },

        specs:x('#specs-list > table',[
            {
                category:"tr th",
                detail:x('tr',[{
                    name:"td.ttl | trim",
                    value:"td.nfo | trim"
                }])
            }
        ]           

        ),

        review:{
            img:"#specs-cp-review-main a img@src",
            title:"#specs-cp-review-main a> div> strong",
            url:"#specs-cp-review-main a@href",
        },


        related:x(' #related-container .swiper-half-slide',[{
            img:"img@src",
            url:"a@href | url",
            title:"a strong",
        }]),
        popular:x(' #popular-container .swiper-half-slide',[{
            img:"img@src",
            url:"a@href | url",
            title:"a strong",
        }]),
    }).then(
        (result) => {
            res.send(result);
            return next();
        }
    ).catch(
        (error) => {
            res.send({
                error: error
            });
            return next();
        }
    )

});

// phones








server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});
