import 'reflect-metadata';
import dataSource from './data-source.js';
import bcrypt from 'bcrypt';
import { DatabaseSync } from 'node:sqlite';

async function runSeed() {
    console.log('Starting database seeding...');
    await dataSource.initialize();

    if (process.argv.includes('--clear')) {
        await dataSource.query('DELETE FROM "order"');
        await dataSource.query('DELETE FROM product');
        await dataSource.query('DELETE FROM user');
        console.log('Semua data seeder berhasil dibersihkan!');
        await dataSource.destroy();
        return;
    }

    const userRepo = dataSource.getRepository('User');
    const productRepo = dataSource.getRepository('Product');

    const existingSeller = await userRepo.findOneBy({ email: 'seller@tokshop.com' });
    if (existingSeller) {
        console.log('Database already seeded. Skipping');
        await dataSource.destroy();
        return;
    }
    const hashedPassword = await bcrypt.hash('password123', 10);

    const seller = userRepo.create({
        name: 'Name Seller',
        email: 'seller@tokshop.com',
        password: hashedPassword,
        role: 'seller',
    });
    await userRepo.save(seller);

    const customer = userRepo.create({
        name: 'Name Customer',
        email: 'customer@tokshop.com',
        password: hashedPassword,
        role: 'customer',
    });
    await userRepo.save(customer);

    const sampleProduct = [
        productRepo.create({
            name: 'Apple Iphone 17',
            price: 17000000,
            quantity: 17,
            description: 'Apple iPhone 17 adalah ponsel pintar flagship standar yang dibekali layar OLED Super Retina XDR 6,3 inci dengan teknologi ProMotion 120Hz dan Always-On. Ponsel ini ditenagai oleh chipset Apple A19 hemat daya dan RAM 8 GB yang dioptimalkan penuh untuk Apple Intelligence. Sektor fotografinya didukung oleh sistem kamera ganda 48 MP (utama dan ultra-lebar) serta kamera depan yang ditingkatkan, sementara daya tahannya diperkuat lapisan kaca luar Ceramic Shield generasi terbaru yang jauh lebih tahan gores.',
            user: seller,
        }),
        productRepo.create({
            name: 'Apple Iphone 17 Pro',
            price: 22000000,
            quantity: 14,
            description: 'iPhone 17 Pro membawa peningkatan premium dengan bodi unibody aluminium yang sedikit lebih tebal (8,8 mm) dan berat (206 g) demi sistem pendingin pipa uap (vapor chamber cooling). Model Pro mengusung chip A19 Pro yang lebih kencang, RAM 12 GB, tiga kamera belakang yang semuanya beresolusi 48 MP (ditambah lensa periskop telefoto dengan zoom optik 8x), serta baterai lebih besar dengan daya tahan putar video hingga 33 jam.',
            user: seller,
        }),
        productRepo.create({
            name: 'Apple Iphone 17 Pro Max',
            price: 26000000,
            quantity: 19,
            description: 'iPhone 17 Pro Max membawa semua spesifikasi premium varian Pro, tetapi dengan ukuran layar OLED Super Retina XDR 6,9 inci yang lebih masif. Model tertinggi ini ditenagai chip Apple A19 Pro dan RAM 12 GB untuk performa AI terbaik, lengkap dengan sistem pendingin pipa uap (vapor chamber cooling) di dalam bodi unibody aluminiumnya. Sektor kamera belakangnya menggunakan tiga lensa yang semuanya beresolusi 48 MP (utama, ultra-lebar, dan periskop telefoto dengan zoom optik hingga 8x), serta kamera depan 18 MP Center Stage. Karena ukuran bodinya yang paling besar, model ini dibekali baterai berkapasitas tertinggi dengan daya tahan pemutaran video yang mencapai hingga 39 jam.',
            user: seller,
        }),
    ];
    await productRepo.save(sampleProduct);
    console.log('Seeding completed successfully!');
    console.log('--Akun Demo Siap Pakai--');
    console.log('Seller     : seller@tokshop.com   | Password: password123');
    console.log('Customer   : customer@tokshop.com | Password: password123');
    console.log('==========================================================');
    await dataSource.destroy();
}
runSeed().catch((err) => {
    console.log('Error during seeding', err);
    process.exit(1);
});