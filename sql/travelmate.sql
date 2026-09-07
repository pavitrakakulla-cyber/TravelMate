-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: travelmate
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Kakulla Pavitra','pavitrakakulla@gmail.com','scrypt:32768:8:1$610vkvMyzj3ZfqsP$38da151b5f875c3693bc881270be1da6df8d9b41af3f6f4d4ad3fc0e9ec34920ac8cdd69c0b2d318400aa16e6f1be38dd1d6454f0840cde063c763e726311a03','2026-08-16 02:29:21');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `package_id` int unsigned NOT NULL,
  `travel_date` date NOT NULL,
  `adults` int unsigned NOT NULL DEFAULT '1',
  `children` int unsigned NOT NULL DEFAULT '0',
  `room_type` enum('standard','deluxe','premium') NOT NULL DEFAULT 'standard',
  `base_amount` decimal(10,2) NOT NULL,
  `additional_charges` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `booking_status` enum('pending','confirmed','cancelled','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  KEY `fk_booking_user` (`user_id`),
  KEY `fk_booking_package` (`package_id`),
  CONSTRAINT `fk_booking_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`package_id`),
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bookings_chk_1` CHECK ((`adults` >= 1)),
  CONSTRAINT `bookings_chk_2` CHECK ((`base_amount` >= 0)),
  CONSTRAINT `bookings_chk_3` CHECK ((`additional_charges` >= 0)),
  CONSTRAINT `bookings_chk_4` CHECK ((`discount_amount` >= 0)),
  CONSTRAINT `bookings_chk_5` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,'2026-08-17',6,2,'standard',51000.00,0.00,0.00,51000.00,'confirmed','2026-08-04 17:43:34','2026-08-16 01:42:58'),(2,1,4,'2026-08-15',2,2,'standard',45000.00,0.00,0.00,45000.00,'cancelled','2026-08-06 06:27:33','2026-08-16 01:41:35'),(3,1,4,'2026-08-15',2,3,'standard',52500.00,0.00,0.00,52500.00,'cancelled','2026-08-14 06:30:49','2026-08-16 01:44:15'),(4,1,3,'2026-08-23',6,8,'standard',120000.00,0.00,12000.00,108000.00,'cancelled','2026-08-14 06:39:57','2026-08-16 01:41:28'),(5,1,3,'2026-08-21',3,7,'standard',78000.00,0.00,0.00,78000.00,'cancelled','2026-08-14 08:29:44','2026-08-16 01:41:14'),(6,1,3,'2026-08-21',3,7,'standard',78000.00,0.00,0.00,78000.00,'cancelled','2026-08-14 08:34:28','2026-08-16 01:41:21'),(7,1,3,'2026-08-21',3,7,'standard',78000.00,0.00,0.00,78000.00,'cancelled','2026-08-14 08:40:12','2026-08-16 01:53:51'),(8,1,1,'2026-08-24',2,1,'premium',21250.00,5000.00,0.00,26250.00,'cancelled','2026-08-14 09:30:43','2026-08-16 01:54:01'),(9,1,1,'2026-08-28',1,1,'deluxe',12750.00,2000.00,0.00,14750.00,'cancelled','2026-08-19 06:42:04','2026-08-19 06:43:56');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `package_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `duration_days` int unsigned NOT NULL,
  `duration_nights` int unsigned NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`),
  CONSTRAINT `packages_chk_1` CHECK ((`duration_days` > 0)),
  CONSTRAINT `packages_chk_2` CHECK ((`base_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Goa Beach Tour','Goa','Enjoy beautiful beaches and water sports.',4,3,8500.00,'goa.jpg',1,'2026-08-04 16:26:03','2026-08-04 16:26:03'),(2,'Kerala Tour','Kerala','Enjoy backwaters and houseboat stay.',5,4,12000.00,'kerala.jpg',1,'2026-08-04 16:26:42','2026-08-04 16:26:42'),(3,'Kerala Tour','Kerala','Enjoy backwaters and houseboat stay.',5,4,12000.00,'kerala.jpg',1,'2026-08-04 16:26:48','2026-08-17 05:18:31'),(4,'Manali Tour','Manali','Snow mountains and adventure activities.',6,5,15000.00,'manali.jpg',1,'2026-08-04 16:27:18','2026-08-04 16:27:18'),(5,'Arakuvalley','vizag','it is beautiful place',7,6,120000.00,'araku',1,'2026-08-17 05:18:14','2026-08-17 05:30:24');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` int unsigned NOT NULL,
  `razorpay_order_id` varchar(255) NOT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_status` enum('created','paid','failed','refunded') NOT NULL DEFAULT 'created',
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `razorpay_order_id` (`razorpay_order_id`),
  UNIQUE KEY `uq_payment_booking` (`booking_id`),
  UNIQUE KEY `razorpay_payment_id` (`razorpay_payment_id`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `payments_chk_1` CHECK ((`amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,3,'order_TPYG1thWaKvHKz',NULL,52500.00,'created',NULL,'2026-08-14 06:30:56','2026-08-14 06:30:56'),(3,4,'order_TPYPaeHnIAIIFD',NULL,108000.00,'created',NULL,'2026-08-14 06:39:59','2026-08-14 06:39:59'),(5,7,'order_TPaSdSmSdIwneg','pay_TPaTM8Ns7mc53x',78000.00,'refunded','Razorpay','2026-08-14 08:40:17','2026-08-16 01:53:51'),(7,8,'order_TPbJzwRTMg3Zxh','pay_TPbKmwbbWQUA6B',26250.00,'refunded','Razorpay','2026-08-14 09:30:48','2026-08-16 01:54:01'),(8,1,'order_TQGOkY7fglBIK2','pay_TQGPh39IMxwkMw',51000.00,'paid','Razorpay','2026-08-16 01:41:43','2026-08-16 01:42:58'),(9,9,'order_TRX7Tntc28lZVk','pay_TRX850oiIx7Znx',14750.00,'refunded','Razorpay','2026-08-19 06:42:10','2026-08-19 06:43:56');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'pavithra','pavitrakakulla@gmail.com','scrypt:32768:8:1$7UNS7bDSHOimeo6M$c96b40646c1e21bac5ba341a3235c7ada1a7289108adfa4f2acafa06554ffced3582ec19e16cebf6f6c0b2ce584379a3e151d653c2c80c8255dfe2d53101e442','996696','2026-07-29 11:10:16','2026-07-29 11:10:16'),(2,'Kakulla Pavitra','pavithra.kakulla.615@gmail.com','scrypt:32768:8:1$AZYWXmAshMxVG0JY$ac0d0a33fe45265265bf3d76a7f140fefaf40f02d4fd7010ff029b03de85631568599046e114129e600869de7cadf9eb1fc91ac3628b57d4925d7ff593bf8988','9966929689','2026-07-30 10:15:12','2026-07-30 10:15:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19 12:35:04
