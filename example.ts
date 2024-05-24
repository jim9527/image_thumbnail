import fs from 'node:fs'
import convert from './src/index'

convert({
    kind: 'fromUri',
    url: 'https://static.thebump.com/tb-web-assets/homepage/homepage-hero-desktop.jpg',
    width: 400,
    height: 400,
}).then((data) => {
    data && fs.writeFileSync('./image.png', data)
})