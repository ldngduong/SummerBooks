const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const ShopManager = require("../models/ShopManager");

const router = express.Router();


// put /api/shop-manager - update shop info - private/admin
router.put("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      categories,
      contact,
      announcement = '',
      heroImage,
      slogan
    } = req.body;

    // Validate name
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Tên cửa hàng là bắt buộc' });
    }
    if (name.length > 100) {
      return res.status(400).json({ message: 'Tên cửa hàng không được vượt quá 100 ký tự' });
    }

    // Validate categories
    if (!categories || categories.length === 0) {
      return res.status(400).json({ message: 'Phải có ít nhất một danh mục' });
    }
    for (const category of categories) {
      if (category && category.length > 50) {
        return res.status(400).json({ message: 'Mỗi danh mục không được vượt quá 50 ký tự' });
      }
    }

    // Validate slogan
    if (slogan && slogan.length > 200) {
      return res.status(400).json({ message: 'Slogan không được vượt quá 200 ký tự' });
    }

    // Validate announcement
    if (announcement && announcement.length > 300) {
      return res.status(400).json({ message: 'Thông báo không được vượt quá 300 ký tự' });
    }

    // Validate contact URLs
    if (contact) {
      const urlPatterns = {
        meta: ['facebook.com', 'fb.com'],
        instagram: ['instagram.com'],
        tiktok: ['tiktok.com'],
        x: ['x.com', 'twitter.com']
      };

      for (const [key, patterns] of Object.entries(urlPatterns)) {
        if (contact[key] && contact[key].trim() !== '') {
          if (contact[key].length > 200) {
            return res.status(400).json({ message: `URL ${key} không được vượt quá 200 ký tự` });
          }
          try {
            const url = new URL(contact[key]);
            const isValid = patterns.some(pattern => url.hostname.includes(pattern));
            if (!isValid) {
              return res.status(400).json({ message: `URL ${key} không hợp lệ` });
            }
          } catch {
            return res.status(400).json({ message: `URL ${key} không hợp lệ` });
          }
        }
      }
    }

    const shopManager = await ShopManager.findById('shopmanager');
    if (shopManager) {
      shopManager.name = name;
      shopManager.categories = categories;
      shopManager.contact = contact || shopManager.contact;
      shopManager.announcement = announcement || '';
      shopManager.heroImage = heroImage || shopManager.heroImage;
      shopManager.slogan = slogan || '';

      const updatedShopManager = await shopManager.save();
      res.status(200).json(updatedShopManager);
    } else {
      res.status(404).json({ message: "Không tìm thấy" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
});


// get /api/shop-manager - get shop info - public
router.get("/", async (req, res) => {
  try {
    const shopManager = await ShopManager.findById('shopmanager')
    res.status(200).json(shopManager);
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
});


module.exports = router;
