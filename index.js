const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require("morgan");
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin/adminroutes');
const userRoutes = require('./routes/user/userroutes');
const vendorRoutes = require('./routes/vendor/vendor');
const categoryRoutes = require('./routes/admin/categoryroutes');
const cartRoutes = require('./routes/user/cartroutes');
const vendorOrderRoutes = require('./routes/vendor/vendororderroutes');
const productRoutes = require('./routes/user/productroutes');
const adminOrderRoutes = require("./routes/admin/adminorderroutes");
const adminanalyticscontroller = require("./routes/admin/adminanalyticroutes");
const adminProductRoutes = require("./routes/admin/adminProductRoutes");
const path = require("path");

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to the Blog API');
});

app.use('/api/admin', adminRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/analytic", adminanalyticscontroller);
app.use('/api/category', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/order', vendorOrderRoutes);
app.use('/api/users', productRoutes);

app.listen(process.env.PORT, () => 
    console.log(`Server is running on port ${process.env.PORT}`)
);