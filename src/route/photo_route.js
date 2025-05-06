const router = require("express")
  .Router()
const PhotoController = require('../controller/photo_controller')

router
  .post('/', PhotoController.createPhoto)
  .get('/', PhotoController.getAllPhotos)
// .get('/', (req, res) => {
//   res.status(200).json({ message: "thanh cong" })
// })
module.exports = router