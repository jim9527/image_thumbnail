### `multer(opts)`

image_thumbnail accepts an options object

The following are the options that can be passed to image_thumbnail.

Key | Description
--- | ---
`kind` | `fromUri|fromBase64|fromPath` - required
`url` | file uri e.g: https//:example.com/image.png - required
`path` | fromPath file path - required
`content` | fromBase64 base64 content - required
`percentage` | 0-100
`width` | number
`height` | number
`format` | `jpeg|png|webp`
`quality` | 0-100
