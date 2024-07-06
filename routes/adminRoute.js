const express=require("express")
const adminRoute=express.Router();
const adminController = require("../controller/admin/adminController")
const admin_session=require("../middleware/adminsession")
const multer = require("../middleware/multer"); 
const categoryController=require("../controller/admin/categoryController")
const productController=require("../controller/admin/productController");
const isAdmin = require("../middleware/adminsession");
const OrderManagement=require("../controller/admin/orderManagement ")
const saleReport=require("../controller/admin/salesReport")

// login
adminRoute.get("/",adminController.adminLogin)

adminRoute.post("/adminLoginPost",adminController.adminLoginPost)

adminRoute.get("/adminDashBoard",isAdmin,adminController.adminDashBoard)
adminRoute.get("/adminCustomer",isAdmin,adminController.adminCustomer)

// block unblock user
adminRoute.get("/blockUser/:id",isAdmin,adminController.blockUser)
adminRoute.get("/unBlockUser/:id",isAdmin,adminController.unBlock)

// logout
adminRoute.get('/logout', isAdmin, adminController.adminLogout);
 

// category
adminRoute.get("/category",isAdmin,categoryController.getCategory)
adminRoute.get("/addCategory",isAdmin,categoryController.addCategory)
adminRoute.post("/addCategory",isAdmin,categoryController.postAddCategory)
adminRoute.get("/editCategory/:id",isAdmin,categoryController.editCategory)
adminRoute.post("/editCategory/:id",isAdmin,categoryController.editCategoryPost)
adminRoute.get("/blockCategory",isAdmin,categoryController.getBlockCategory)
adminRoute.get("/checkCategoryExists", isAdmin, categoryController.checkCategoryExists);


// product view
adminRoute.get('/productManagement',isAdmin,productController.getProductManage) 
adminRoute.get("/addProduct",isAdmin,productController.getAddProduct)
adminRoute.post('/addProduct',multer.upload.array('productImage',3), productController.postAddProduct)
adminRoute.get('/editProduct/:proId',isAdmin, productController.getEditProduct)
adminRoute.post('/editProduct/:proId',multer.upload.array('productImage', 3), productController.postEditProduct)
adminRoute.get('/blockProduct',isAdmin, productController.getBlockProduct)
adminRoute.get('/deleteSingleImage/:id/:index',isAdmin, productController.getDeleteSingleImage)

// order management

adminRoute.get("/orders",OrderManagement.getOrderManagement)
adminRoute.post("/orders/:orderId/status",OrderManagement.postOrderManagement)

// salesReport

adminRoute.get("/sales-report",saleReport.getSalesReports)
// adminRoute.get("/sales-reports/pdf",saleReport.saleReport)
adminRoute.get("/sales-reports",saleReport.generatePDFReport)






module.exports=adminRoute