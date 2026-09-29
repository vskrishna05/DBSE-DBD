-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: fincore_db
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
-- Current Database: `fincore_db`
--

/*!40000 DROP DATABASE IF EXISTS `fincore_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `fincore_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `fincore_db`;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `finance_company_id` int NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_admins_email` (`email`),
  UNIQUE KEY `ix_admins_mobile_number` (`mobile_number`),
  KEY `ix_admins_finance_company_id` (`finance_company_id`),
  KEY `ix_admins_id` (`id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`finance_company_id`) REFERENCES `finance_companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (22,23,'admin@finnova.in','$2b$12$6xqNMyovgV7K3TRZWregDObhTMRJ/FsHr9HuZhvHXXeDuR2IBgAEG','FinNova Head Administrator','admin',1,'2026-09-27 07:29:50','2026-09-27 12:14:04','9876543210'),(23,24,'admin@crednest.in','$2b$12$6xqNMyovgV7K3TRZWregDObhTMRJ/FsHr9HuZhvHXXeDuR2IBgAEG','CredNest Principal Officer','admin',1,'2026-09-27 07:29:51','2026-09-27 12:14:04','9876543211');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('9804ec2b10b2');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` int DEFAULT NULL,
  `action` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `metadata_json` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_actor` (`actor_type`,`actor_id`),
  KEY `idx_audit_logs_created` (`created_at`),
  KEY `idx_audit_logs_entity` (`entity`,`entity_id`),
  KEY `ix_audit_logs_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'ADMIN',1,'ADMIN_LOGIN_SUCCESS','admins',1,NULL,'127.0.0.1','2026-09-26 16:09:26'),(2,'ADMIN',1,'ADMIN_LOGIN_SUCCESS','admins',1,NULL,'127.0.0.1','2026-09-26 16:25:03'),(3,'CUSTOMER',1,'CUSTOMER_REGISTRATION','customers',1,NULL,'127.0.0.1','2026-09-26 16:25:04'),(4,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',1,'{\"invoice_number\": \"INV-AGB-2026-0001-6EC5\", \"total\": \"93.45\"}',NULL,'2026-09-26 16:25:04'),(5,'CUSTOMER',1,'SUBSCRIBE_TO_PLAN','subscriptions',1,'{\"plan_id\": 2, \"plan_name\": \"Premier Enterprise Tier\", \"invoice_id\": 1}',NULL,'2026-09-26 16:25:04'),(6,'CUSTOMER',1,'PAYMENT_SUCCESS','payments',1,'{\"payment_ref\": \"PAY-202609-52B1C514\", \"invoice_number\": \"INV-AGB-2026-0001-6EC5\", \"amount\": \"93.45\", \"gateway_id\": \"TXN_SANDBOX_BFA04FF227BB\"}',NULL,'2026-09-26 16:25:04'),(7,'ADMIN',NULL,'LOAN_SANCTIONED','loans',1,'{\"loan_account\": \"LN-2026-00001\", \"principal\": \"15000.0\", \"effective_rate\": \"8.50\"}',NULL,'2026-09-26 16:25:04'),(8,'CUSTOMER',1,'LOAN_REPAYMENT','loans',1,'{\"loan_account\": \"LN-2026-00001\", \"amount\": \"500.00\", \"new_balance\": \"14606.25\"}',NULL,'2026-09-26 16:25:04'),(9,'CUSTOMER',2,'CUSTOMER_REGISTRATION','customers',2,NULL,'127.0.0.1','2026-09-26 16:28:24'),(10,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',2,'{\"invoice_number\": \"INV-HDT-2026-0002-D246\", \"total\": \"47.25\"}',NULL,'2026-09-26 16:29:07'),(11,'CUSTOMER',2,'SUBSCRIBE_TO_PLAN','subscriptions',2,'{\"plan_id\": 5, \"plan_name\": \"Digital Silver Trust\", \"invoice_id\": 2}',NULL,'2026-09-26 16:29:07'),(12,'CUSTOMER',2,'PAYMENT_SUCCESS','payments',2,'{\"payment_ref\": \"PAY-202609-9AC492E8\", \"invoice_number\": \"INV-HDT-2026-0002-D246\", \"amount\": \"47.25\", \"gateway_id\": \"TXN_SANDBOX_59D1582D5B79\"}',NULL,'2026-09-26 16:29:10'),(13,'ADMIN',1,'ADMIN_LOGIN_SUCCESS','admins',1,NULL,'127.0.0.1','2026-09-26 16:29:49'),(14,'CUSTOMER',2,'LOGIN_SUCCESS','customers',2,NULL,'127.0.0.1','2026-09-26 16:34:47'),(15,'CUSTOMER',3,'MOBILE_OTP_LOGIN_SUCCESS','customers',3,NULL,'127.0.0.1','2026-09-26 16:43:43'),(16,'ADMIN',NULL,'LOAN_SANCTIONED','loans',6,'{\"loan_account\": \"LN-2026-00005\", \"principal\": \"50000.00\", \"effective_rate\": \"11.50\"}',NULL,'2026-09-26 16:43:43'),(17,'ADMIN',5,'ADMIN_MOBILE_OTP_LOGIN_SUCCESS','admins',5,NULL,'127.0.0.1','2026-09-26 16:43:44'),(18,'CUSTOMER',3,'GOOGLE_AUTH_SUCCESS','customers',3,NULL,'127.0.0.1','2026-09-26 16:43:44'),(19,'CUSTOMER',3,'MOBILE_OTP_LOGIN_SUCCESS','customers',3,NULL,'127.0.0.1','2026-09-26 16:52:04'),(20,'ADMIN',NULL,'LOAN_SANCTIONED','loans',7,'{\"loan_account\": \"LN-2026-00006\", \"principal\": \"50000.00\", \"effective_rate\": \"11.50\"}',NULL,'2026-09-26 16:52:04'),(21,'ADMIN',5,'ADMIN_MOBILE_OTP_LOGIN_SUCCESS','admins',5,NULL,'127.0.0.1','2026-09-26 16:52:04'),(22,'CUSTOMER',3,'GOOGLE_AUTH_SUCCESS','customers',3,NULL,'127.0.0.1','2026-09-26 16:52:04'),(23,'COMPANY_ONBOARDING',6,'INSTITUTION_REGISTERED','finance_companies',7,'{\"company_name\": \"Shivalik Apex SFB 1790441524\", \"gstin\": \"07AAAAA0000A1Z5\"}',NULL,'2026-09-26 16:52:05'),(24,'ADMIN',11,'ADMIN_LOGIN_SUCCESS','admins',11,NULL,'127.0.0.1','2026-09-27 05:12:17'),(25,'CUSTOMER',21,'CUSTOMER_REGISTRATION','customers',21,NULL,'127.0.0.1','2026-09-27 05:12:18'),(26,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',21,'{\"invoice_number\": \"INV-FINNOVA-2026-0007-77F9\", \"total\": \"4198.95\"}',NULL,'2026-09-27 05:12:18'),(27,'CUSTOMER',21,'SUBSCRIBE_TO_PLAN','subscriptions',21,'{\"plan_id\": 21, \"plan_name\": \"Enterprise Elite Tier\", \"invoice_id\": 21}',NULL,'2026-09-27 05:12:18'),(28,'CUSTOMER',21,'PAYMENT_SUCCESS','payments',21,'{\"payment_ref\": \"PAY-202609-CC45458D\", \"invoice_number\": \"INV-FINNOVA-2026-0007-77F9\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_647DC85D073E\"}',NULL,'2026-09-27 05:12:18'),(29,'ADMIN',NULL,'LOAN_SANCTIONED','loans',22,'{\"loan_account\": \"LN-2026-00007\", \"principal\": \"15000.0\", \"effective_rate\": \"8.50\"}',NULL,'2026-09-27 05:12:18'),(30,'CUSTOMER',21,'LOAN_REPAYMENT','loans',22,'{\"loan_account\": \"LN-2026-00007\", \"amount\": \"500.00\", \"new_balance\": \"14606.25\"}',NULL,'2026-09-27 05:12:18'),(31,'CUSTOMER',15,'MOBILE_OTP_LOGIN_SUCCESS','customers',15,NULL,'127.0.0.1','2026-09-27 05:13:50'),(32,'CUSTOMER',15,'GOOGLE_AUTH_SUCCESS','customers',15,NULL,'127.0.0.1','2026-09-27 05:13:50'),(33,'ADMIN',11,'ADMIN_MOBILE_OTP_LOGIN_SUCCESS','admins',11,NULL,'127.0.0.1','2026-09-27 05:13:50'),(34,'ADMIN',11,'ADMIN_GOOGLE_AUTH_SUCCESS','admins',11,NULL,'127.0.0.1','2026-09-27 05:13:50'),(35,'CUSTOMER',15,'MOBILE_OTP_LOGIN_SUCCESS','customers',15,NULL,'127.0.0.1','2026-09-27 05:14:04'),(36,'ADMIN',NULL,'LOAN_SANCTIONED','loans',23,'{\"loan_account\": \"LN-2026-00008\", \"principal\": \"250000.0\", \"effective_rate\": \"12.00\"}',NULL,'2026-09-27 05:14:04'),(37,'CUSTOMER',15,'MOBILE_OTP_LOGIN_SUCCESS','customers',15,NULL,'127.0.0.1','2026-09-27 05:14:27'),(38,'ADMIN',NULL,'LOAN_SANCTIONED','loans',24,'{\"loan_account\": \"LN-2026-00009\", \"principal\": \"150000.0\", \"effective_rate\": \"12.00\"}',NULL,'2026-09-27 05:14:27'),(39,'COMPANY_ONBOARDING',13,'INSTITUTION_REGISTERED','finance_companies',14,'{\"company_name\": \"Shivalik Small Finance Bank\", \"gstin\": \"27AAACS1234F1Z9\"}',NULL,'2026-09-27 05:14:58'),(40,'ADMIN',16,'ADMIN_LOGIN_SUCCESS','admins',16,NULL,'127.0.0.1','2026-09-27 05:16:36'),(41,'CUSTOMER',34,'CUSTOMER_REGISTRATION','customers',34,NULL,'127.0.0.1','2026-09-27 05:16:36'),(42,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',34,'{\"invoice_number\": \"INV-FINNOVA-2026-0007-AA23\", \"total\": \"4198.95\"}',NULL,'2026-09-27 05:16:36'),(43,'CUSTOMER',34,'SUBSCRIBE_TO_PLAN','subscriptions',34,'{\"plan_id\": 31, \"plan_name\": \"Enterprise Elite Tier\", \"invoice_id\": 34}',NULL,'2026-09-27 05:16:36'),(44,'CUSTOMER',34,'PAYMENT_SUCCESS','payments',34,'{\"payment_ref\": \"PAY-202609-0402D5A0\", \"invoice_number\": \"INV-FINNOVA-2026-0007-AA23\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_9C3791AE6066\"}',NULL,'2026-09-27 05:16:36'),(45,'ADMIN',NULL,'LOAN_SANCTIONED','loans',37,'{\"loan_account\": \"LN-2026-00007\", \"principal\": \"15000.0\", \"effective_rate\": \"8.50\"}',NULL,'2026-09-27 05:16:37'),(46,'CUSTOMER',34,'LOAN_REPAYMENT','loans',37,'{\"loan_account\": \"LN-2026-00007\", \"amount\": \"500.00\", \"new_balance\": \"14606.25\"}',NULL,'2026-09-27 05:16:37'),(47,'ADMIN',16,'ADMIN_LOGIN_SUCCESS','admins',16,NULL,'127.0.0.1','2026-09-27 05:16:52'),(48,'CUSTOMER',35,'CUSTOMER_REGISTRATION','customers',35,NULL,'127.0.0.1','2026-09-27 05:16:53'),(49,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',35,'{\"invoice_number\": \"INV-FINNOVA-2026-0008-6B1A\", \"total\": \"4198.95\"}',NULL,'2026-09-27 05:16:53'),(50,'CUSTOMER',35,'SUBSCRIBE_TO_PLAN','subscriptions',35,'{\"plan_id\": 31, \"plan_name\": \"Enterprise Elite Tier\", \"invoice_id\": 35}',NULL,'2026-09-27 05:16:53'),(51,'CUSTOMER',35,'PAYMENT_SUCCESS','payments',35,'{\"payment_ref\": \"PAY-202609-63A97FFF\", \"invoice_number\": \"INV-FINNOVA-2026-0008-6B1A\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_66A7D3EE4D7B\"}',NULL,'2026-09-27 05:16:53'),(52,'ADMIN',NULL,'LOAN_SANCTIONED','loans',38,'{\"loan_account\": \"LN-2026-00008\", \"principal\": \"15000.0\", \"effective_rate\": \"8.50\"}',NULL,'2026-09-27 05:16:53'),(53,'CUSTOMER',35,'LOAN_REPAYMENT','loans',38,'{\"loan_account\": \"LN-2026-00008\", \"amount\": \"500.00\", \"new_balance\": \"14606.25\"}',NULL,'2026-09-27 05:16:54'),(54,'CUSTOMER',36,'CUSTOMER_REGISTRATION','customers',36,NULL,'127.0.0.1','2026-09-27 05:20:24'),(55,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',36,'{\"invoice_number\": \"INV-CREDNEST-2026-0009-1ECE\", \"total\": \"1048.95\"}',NULL,'2026-09-27 05:25:29'),(56,'CUSTOMER',36,'SUBSCRIBE_TO_PLAN','subscriptions',36,'{\"plan_id\": 32, \"plan_name\": \"MSME Catalyst Tier\", \"invoice_id\": 36}',NULL,'2026-09-27 05:25:29'),(57,'CUSTOMER',36,'PAYMENT_SUCCESS','payments',36,'{\"payment_ref\": \"PAY-202609-554460A0\", \"invoice_number\": \"INV-CREDNEST-2026-0009-1ECE\", \"amount\": \"1048.95\", \"gateway_id\": \"TXN_SANDBOX_2C21BFC5E13F\"}',NULL,'2026-09-27 05:25:34'),(58,'CUSTOMER',36,'LOGIN_SUCCESS','customers',36,NULL,'127.0.0.1','2026-09-27 05:27:05'),(59,'CUSTOMER',36,'MOBILE_OTP_LOGIN_SUCCESS','customers',36,NULL,'127.0.0.1','2026-09-27 05:34:28'),(60,'CUSTOMER',36,'LOGIN_SUCCESS','customers',36,NULL,'127.0.0.1','2026-09-27 05:36:11'),(61,'ADMIN',NULL,'LOAN_SANCTIONED','loans',39,'{\"loan_account\": \"LN-2026-00009\", \"principal\": \"55000\", \"effective_rate\": \"10.75\"}',NULL,'2026-09-27 05:39:07'),(62,'ADMIN',17,'ADMIN_MOBILE_OTP_LOGIN_SUCCESS','admins',17,NULL,'127.0.0.1','2026-09-27 05:41:29'),(63,'ADMIN',NULL,'LOAN_SANCTIONED','loans',40,'{\"loan_account\": \"LN-2026-00010\", \"principal\": \"5000\", \"effective_rate\": \"10.75\"}',NULL,'2026-09-27 05:41:44'),(64,'ADMIN',18,'ADMIN_LOGIN_SUCCESS','admins',18,NULL,'127.0.0.1','2026-09-27 06:02:11'),(65,'CUSTOMER',43,'CUSTOMER_REGISTRATION','customers',43,NULL,'127.0.0.1','2026-09-27 06:02:11'),(66,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',43,'{\"invoice_number\": \"INV-FINNOVA-2026-0007-F372\", \"total\": \"4198.95\"}',NULL,'2026-09-27 06:02:11'),(67,'CUSTOMER',43,'SUBSCRIBE_TO_PLAN','subscriptions',43,'{\"plan_id\": 35, \"plan_name\": \"Premium Plan\", \"invoice_id\": 43}',NULL,'2026-09-27 06:02:11'),(68,'CUSTOMER',43,'PAYMENT_SUCCESS','payments',43,'{\"payment_ref\": \"PAY-202609-652D714D\", \"invoice_number\": \"INV-FINNOVA-2026-0007-F372\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_4F23D9D5C441\"}',NULL,'2026-09-27 06:02:11'),(69,'CUSTOMER',NULL,'LOAN_APPLICATION_SUBMITTED','loans',47,'{\"loan_account\": \"LN-2026-00007\", \"principal\": \"15000.0\", \"effective_rate\": \"8.50\", \"status\": \"PENDING\"}',NULL,'2026-09-27 06:02:11'),(70,'ADMIN',18,'LOAN_CONFIRMED_AND_DISBURSED','loans',47,'{\"loan_account\": \"LN-2026-00007\", \"status\": \"ACTIVE\"}',NULL,'2026-09-27 06:02:11'),(71,'CUSTOMER',43,'LOAN_REPAYMENT','loans',47,'{\"loan_account\": \"LN-2026-00007\", \"amount\": \"500.00\", \"new_balance\": \"14606.25\"}',NULL,'2026-09-27 06:02:11'),(72,'ADMIN',20,'ADMIN_LOGIN_SUCCESS','admins',20,NULL,'127.0.0.1','2026-09-27 06:05:47'),(73,'ADMIN',20,'ADMIN_LOGIN_SUCCESS','admins',20,NULL,'127.0.0.1','2026-09-27 06:22:31'),(74,'CUSTOMER',50,'CUSTOMER_REGISTRATION','customers',50,NULL,'127.0.0.1','2026-09-27 06:26:28'),(75,'ADMIN',20,'ADMIN_LOGIN_SUCCESS','admins',20,NULL,'127.0.0.1','2026-09-27 06:49:23'),(76,'ADMIN',20,'ADMIN_LOGIN_SUCCESS','admins',20,NULL,'127.0.0.1','2026-09-27 06:49:44'),(77,'CUSTOMER',51,'CUSTOMER_REGISTRATION','customers',51,NULL,'127.0.0.1','2026-09-27 06:49:45'),(78,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',50,'{\"invoice_number\": \"INV-FINNOVA-2026-0007-5FBA\", \"total\": \"4198.95\"}',NULL,'2026-09-27 06:49:45'),(79,'CUSTOMER',51,'SUBSCRIBE_TO_PLAN','subscriptions',50,'{\"plan_id\": 39, \"plan_name\": \"Premium Plan\", \"invoice_id\": 50}',NULL,'2026-09-27 06:49:45'),(80,'CUSTOMER',51,'PAYMENT_SUCCESS','payments',50,'{\"payment_ref\": \"PAY-202609-87B68690\", \"invoice_number\": \"INV-FINNOVA-2026-0007-5FBA\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_A6F2D0D4B685\"}',NULL,'2026-09-27 06:49:46'),(81,'ADMIN',20,'ADMIN_LOGIN_SUCCESS','admins',20,NULL,'127.0.0.1','2026-09-27 06:50:10'),(82,'CUSTOMER',52,'CUSTOMER_REGISTRATION','customers',52,NULL,'127.0.0.1','2026-09-27 06:50:11'),(83,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',51,'{\"invoice_number\": \"INV-FINNOVA-2026-0008-7F74\", \"total\": \"4198.95\"}',NULL,'2026-09-27 06:50:11'),(84,'CUSTOMER',52,'SUBSCRIBE_TO_PLAN','subscriptions',51,'{\"plan_id\": 39, \"plan_name\": \"Premium Plan\", \"invoice_id\": 51}',NULL,'2026-09-27 06:50:11'),(85,'CUSTOMER',52,'PAYMENT_SUCCESS','payments',51,'{\"payment_ref\": \"PAY-202609-B8DE5288\", \"invoice_number\": \"INV-FINNOVA-2026-0008-7F74\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_0AD45AC90E6D\"}',NULL,'2026-09-27 06:50:11'),(86,'CUSTOMER',NULL,'LOAN_APPLICATION_SUBMITTED','loans',54,'{\"loan_account\": \"LN-2026-00007\", \"principal\": \"50000.0\", \"effective_rate\": \"8.50\", \"status\": \"PENDING\"}',NULL,'2026-09-27 06:50:11'),(87,'ADMIN',20,'LOAN_CONFIRMED_AND_DISBURSED','loans',54,'{\"loan_account\": \"LN-2026-00007\", \"status\": \"ACTIVE\"}',NULL,'2026-09-27 06:50:11'),(88,'CUSTOMER',52,'LOAN_REPAYMENT','loans',54,'{\"loan_account\": \"LN-2026-00007\", \"amount\": \"500.00\", \"new_balance\": \"49854.17\"}',NULL,'2026-09-27 06:50:11'),(89,'ADMIN',20,'ADMIN_LOGIN_SUCCESS','admins',20,NULL,'127.0.0.1','2026-09-27 07:29:21'),(90,'CUSTOMER',53,'CUSTOMER_REGISTRATION','customers',53,NULL,'127.0.0.1','2026-09-27 07:29:39'),(91,'SYSTEM',NULL,'INVOICE_GENERATED','invoices',52,'{\"invoice_number\": \"INV-FINNOVA-2026-0009-F946\", \"total\": \"4198.95\"}',NULL,'2026-09-27 07:29:39'),(92,'CUSTOMER',53,'SUBSCRIBE_TO_PLAN','subscriptions',52,'{\"plan_id\": 39, \"plan_name\": \"Premium Plan\", \"invoice_id\": 52}',NULL,'2026-09-27 07:29:39'),(93,'CUSTOMER',53,'PAYMENT_SUCCESS','payments',52,'{\"payment_ref\": \"PAY-202609-35F33F42\", \"invoice_number\": \"INV-FINNOVA-2026-0009-F946\", \"amount\": \"4198.95\", \"gateway_id\": \"TXN_SANDBOX_6B3692CE5AAD\"}',NULL,'2026-09-27 07:29:39'),(94,'CUSTOMER',NULL,'LOAN_APPLICATION_SUBMITTED','loans',55,'{\"loan_account\": \"LN-2026-00008\", \"principal\": \"50000.0\", \"effective_rate\": \"8.50\", \"status\": \"PENDING\"}',NULL,'2026-09-27 07:29:39'),(95,'ADMIN',20,'LOAN_CONFIRMED_AND_DISBURSED','loans',55,'{\"loan_account\": \"LN-2026-00008\", \"status\": \"ACTIVE\"}',NULL,'2026-09-27 07:29:39'),(96,'CUSTOMER',53,'LOAN_REPAYMENT','loans',55,'{\"loan_account\": \"LN-2026-00008\", \"amount\": \"500.00\", \"new_balance\": \"49854.17\"}',NULL,'2026-09-27 07:29:39'),(97,'CUSTOMER',54,'GMAIL_OTP_LOGIN_SUCCESS','customers',54,NULL,'127.0.0.1','2026-09-27 07:56:38'),(98,'ADMIN',22,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 07:56:53'),(99,'CUSTOMER',NULL,'LOAN_APPLICATION_SUBMITTED','loans',62,'{\"loan_account\": \"LN-2026-00007\", \"principal\": \"300000.00\", \"effective_rate\": \"11.00\", \"status\": \"PENDING\"}',NULL,'2026-09-27 07:56:54'),(100,'ADMIN',22,'LOAN_CONFIRMED_AND_DISBURSED','loans',62,'{\"loan_account\": \"LN-2026-00007\", \"status\": \"ACTIVE\"}',NULL,'2026-09-27 07:56:54'),(101,'CUSTOMER',54,'GMAIL_OTP_LOGIN_SUCCESS','customers',54,NULL,'127.0.0.1','2026-09-27 11:18:29'),(102,'ADMIN',22,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 11:18:34'),(103,'CUSTOMER',NULL,'LOAN_APPLICATION_SUBMITTED','loans',63,'{\"loan_account\": \"LN-2026-00008\", \"principal\": \"300000.00\", \"effective_rate\": \"11.00\", \"status\": \"PENDING\"}',NULL,'2026-09-27 11:18:34'),(104,'ADMIN',22,'LOAN_CONFIRMED_AND_DISBURSED','loans',63,'{\"loan_account\": \"LN-2026-00008\", \"status\": \"ACTIVE\"}',NULL,'2026-09-27 11:18:35'),(105,'CUSTOMER',60,'CUSTOMER_REGISTRATION','customers',60,NULL,'127.0.0.1','2026-09-27 11:18:35'),(106,'ADMIN',22,'DELETE_CUSTOMER','customers',NULL,'{\"deleted_customer_email\": \"temp.del.1790507914@gmail.com\", \"name\": \"TempToDelete Client\"}',NULL,'2026-09-27 11:18:35'),(107,'ADMIN',22,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 11:29:41'),(108,'ADMIN',23,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',23,NULL,'127.0.0.1','2026-09-27 11:31:53'),(109,'CUSTOMER',61,'CUSTOMER_REGISTRATION','customers',61,NULL,'127.0.0.1','2026-09-27 11:34:14'),(110,'CUSTOMER',61,'LOGIN_SUCCESS','customers',61,NULL,'127.0.0.1','2026-09-27 11:36:24'),(111,'CUSTOMER',62,'GOOGLE_AUTH_SUCCESS','customers',62,NULL,'127.0.0.1','2026-09-27 11:36:45'),(112,'CUSTOMER',62,'UPDATE_PROFILE','customers',62,NULL,NULL,'2026-09-27 11:37:06'),(113,'ADMIN',22,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 11:37:53'),(114,'ADMIN',22,'DELETE_CUSTOMER','customers',NULL,'{\"deleted_customer_email\": \"vsktupakula05@gmail.com\", \"name\": \"VSK Naidu\"}',NULL,'2026-09-27 11:38:02'),(115,'ADMIN',22,'DELETE_CUSTOMER','customers',NULL,'{\"deleted_customer_email\": \"venkatsaikrishnatupakula5@gmail.com\", \"name\": \"Venkata Sai Krishna\"}',NULL,'2026-09-27 11:38:06'),(116,'ADMIN',22,'ADMIN_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 12:49:12'),(117,'ADMIN',23,'ADMIN_LOGIN_SUCCESS','admins',23,NULL,'127.0.0.1','2026-09-27 12:49:12'),(118,'ADMIN',24,'ADMIN_LOGIN_SUCCESS','admins',24,NULL,'127.0.0.1','2026-09-27 12:49:12'),(119,'ADMIN',24,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',24,NULL,'127.0.0.1','2026-09-27 12:49:18'),(120,'ADMIN',22,'ADMIN_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 12:51:33'),(121,'ADMIN',22,'DELETE_CUSTOMER','customers',NULL,'{\"deleted_customer_email\": \"vsktupakula05@gmail.com\", \"name\": \"Lead Customer\"}',NULL,'2026-09-27 12:51:41'),(122,'CUSTOMER',64,'CUSTOMER_REGISTRATION','customers',64,NULL,'127.0.0.1','2026-09-27 12:57:12'),(123,'ADMIN',24,'ADMIN_LOGIN_SUCCESS','admins',24,NULL,'127.0.0.1','2026-09-27 12:58:01'),(124,'ADMIN',24,'DELETE_CUSTOMER','customers',NULL,'{\"deleted_customer_email\": \"venkatsaikrishnatupakula5@gmail.com\", \"name\": \"VSK Tupakula\"}',NULL,'2026-09-27 12:58:28'),(125,'CUSTOMER',65,'CUSTOMER_REGISTRATION','customers',65,NULL,'127.0.0.1','2026-09-27 13:03:01'),(126,'CUSTOMER',66,'CUSTOMER_REGISTRATION','customers',66,NULL,'127.0.0.1','2026-09-27 15:12:02'),(127,'CUSTOMER',66,'LOGIN_SUCCESS','customers',66,NULL,'127.0.0.1','2026-09-27 15:12:46'),(128,'CUSTOMER',NULL,'LOAN_APPLICATION_SUBMITTED','loans',64,'{\"loan_account\": \"LN-2026-00009\", \"principal\": \"50000\", \"effective_rate\": \"11.50\", \"status\": \"PENDING\"}',NULL,'2026-09-27 15:13:28'),(129,'ADMIN',22,'ADMIN_GMAIL_OTP_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 15:16:28'),(130,'ADMIN',22,'ADMIN_LOGIN_SUCCESS','admins',22,NULL,'127.0.0.1','2026-09-27 15:26:07'),(131,'ADMIN',23,'ADMIN_LOGIN_SUCCESS','admins',23,NULL,'127.0.0.1','2026-09-27 15:26:08');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_profiles`
--

DROP TABLE IF EXISTS `customer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `phone_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_score` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_customer_profiles_customer_id` (`customer_id`),
  KEY `ix_customer_profiles_id` (`id`),
  CONSTRAINT `customer_profiles_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_profiles`
--

LOCK TABLES `customer_profiles` WRITE;
/*!40000 ALTER TABLE `customer_profiles` DISABLE KEYS */;
INSERT INTO `customer_profiles` VALUES (54,54,'9820011223','Plot 42, Prime Financial Road','Mumbai','Maharashtra','400001','India',780,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(55,55,'9820022334','Plot 42, Prime Financial Road','Pune','Maharashtra','411001','India',810,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(56,56,'9820033445','Plot 42, Prime Financial Road','Pune','Maharashtra','411004','India',795,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(57,57,'9830033445','Plot 42, Prime Financial Road','Bengaluru','Karnataka','560001','India',765,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(58,58,'9830044556','Plot 42, Prime Financial Road','Chennai','Tamil Nadu','600001','India',825,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(59,59,'9830055667','Plot 42, Prime Financial Road','Hyderabad','Telangana','500081','India',810,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(65,65,'6302275144',NULL,'Hyd','',NULL,'India',720,'2026-09-27 13:03:01','2026-09-27 13:03:01'),(66,66,'8008117761',NULL,'HYD','',NULL,'India',720,'2026-09-27 15:12:02','2026-09-27 15:12:02');
/*!40000 ALTER TABLE `customer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `finance_company_id` int NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hashed_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_customers_email` (`email`),
  UNIQUE KEY `ix_customers_mobile_number` (`mobile_number`),
  KEY `ix_customers_finance_company_id` (`finance_company_id`),
  KEY `ix_customers_id` (`id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`finance_company_id`) REFERENCES `finance_companies` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (54,23,'aarav.sharma@gmail.com','$2b$12$OFmH5wmRqM7fZLnivpkiyeGTN5aPYxXri07B.RKBkMxj0A68p6N3W','Aarav','Sharma',1,1,'2026-09-27 07:29:50','2026-09-27 07:29:50','9820011223'),(55,23,'priya.patel@gmail.com','$2b$12$eZiPLjRrgCVBTYvUOBFxfejR3iO51nj4MaG6t.BkVrRz9q/gHIY9K','Priya','Patel',1,1,'2026-09-27 07:29:51','2026-09-27 07:29:51','9820022334'),(56,23,'rajesh.nair@gmail.com','$2b$12$TYzgu.AC4zkDFvPftQRiEe94.lNEm7BZ5L9BssmyD7.3ed3J23xkm','Rajesh','Nair',1,1,'2026-09-27 07:29:51','2026-09-27 07:29:51','9820033445'),(57,24,'rohit.verma@gmail.com','$2b$12$llD8U.0IIfty5sShTO1r9uTXMgXC.iduhm8vOgrp7TpAz51GtkHtu','Rohit','Verma',1,1,'2026-09-27 07:29:52','2026-09-27 07:29:52','9830033445'),(58,24,'ananya.iyer@gmail.com','$2b$12$RxIPqAkLUTbOle9FtJ6qCOSimpEQQmtg8FwZzEylb6aHnAo6g.Pvy','Ananya','Iyer',1,1,'2026-09-27 07:29:52','2026-09-27 07:29:52','9830044556'),(59,24,'sneha.kulkarni@gmail.com','$2b$12$FLERZVuM4Q.T6PAW2FdXZ.oyotgKeO5W5FgOZE05adgYzvfGS8Xgu','Sneha','Kulkarni',1,1,'2026-09-27 07:29:52','2026-09-27 07:29:52','9830055667'),(65,23,'tupakula03@gmail.com','$2b$12$J4lZjlKNPRNnn0qFCAkY/.RM2t.zbqNh7FUzUiedNofDb8/ndFdWK','Aruna','Sri',1,1,'2026-09-27 13:03:01','2026-09-27 13:03:01',NULL),(66,23,'krishnakumaritupakula2826@gmail.com','$2b$12$DhJ/vPqVeK7rngFqCNAEWe5HxDgPptq6I/.5XKlm4eWY1IkGYbxbS','Aruna','Tupakula',1,1,'2026-09-27 15:12:02','2026-09-27 15:12:02',NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finance_companies`
--

DROP TABLE IF EXISTS `finance_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_number` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `gstin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_loan_amount` decimal(14,2) NOT NULL DEFAULT '25000.00',
  `max_loan_amount` decimal(14,2) NOT NULL DEFAULT '2500000.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_number` (`license_number`),
  UNIQUE KEY `ix_finance_companies_code` (`code`),
  UNIQUE KEY `ix_finance_companies_name` (`name`),
  UNIQUE KEY `ix_finance_companies_gstin` (`gstin`),
  KEY `ix_finance_companies_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_companies`
--

LOCK TABLES `finance_companies` WRITE;
/*!40000 ALTER TABLE `finance_companies` DISABLE KEYS */;
INSERT INTO `finance_companies` VALUES (23,'FinNova Small Finance Bank','FINNOVA','RBI/2021/FINNOVA/104','support@finnova.in','+91-22-68001000','Bandra Kurla Complex, Bandra East, Mumbai',1,'2026-09-27 07:29:50','2026-09-27 07:29:50','27AABCF1234F1Z5','AABCF1234F','Maharashtra','400051',25000.00,2500000.00),(24,'CredNest Small Finance Bank','CREDNEST','RBI/2022/CREDNEST/218','support@crednest.in','+91-124-4900200','Cyber City, DLF Phase 2, Gurugram',1,'2026-09-27 07:29:51','2026-09-27 07:29:51','06AABCC5678C1Z2','AABCC5678C','Haryana','122002',25000.00,2500000.00);
/*!40000 ALTER TABLE `finance_companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_invoice_items_id` (`id`),
  KEY `ix_invoice_items_invoice_id` (`invoice_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
INSERT INTO `invoice_items` VALUES (53,53,'Basic Plan Monthly Subscription',1,1499.00,1499.00,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(54,54,'Premium Plan Monthly Subscription',1,3999.00,3999.00,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(55,55,'Basic Plan Monthly Subscription',1,1499.00,1499.00,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(56,56,'Basic Plan Monthly Subscription',1,999.00,999.00,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(57,57,'Premium Plan Monthly Subscription',1,4499.00,4499.00,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(58,58,'Basic Plan Monthly Subscription',1,999.00,999.00,'2026-09-27 07:29:52','2026-09-27 07:29:52');
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int NOT NULL,
  `finance_company_id` int NOT NULL,
  `subscription_id` int DEFAULT NULL,
  `status` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `tax_amount` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `due_date` datetime NOT NULL,
  `paid_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_invoices_invoice_number` (`invoice_number`),
  KEY `idx_invoices_company_status` (`finance_company_id`,`status`),
  KEY `idx_invoices_customer_status` (`customer_id`,`status`),
  KEY `ix_invoices_customer_id` (`customer_id`),
  KEY `ix_invoices_finance_company_id` (`finance_company_id`),
  KEY `ix_invoices_id` (`id`),
  KEY `ix_invoices_subscription_id` (`subscription_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`finance_company_id`) REFERENCES `finance_companies` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (53,'INV-FINNOVA-2026-0001',54,23,53,'PAID',1499.00,74.95,0.00,1573.95,'2026-09-22 07:29:50','2026-09-21 07:29:50','2026-09-27 07:29:50','2026-09-27 07:29:50'),(54,'INV-FINNOVA-2026-0002',55,23,54,'PAID',3999.00,199.95,0.00,4198.95,'2026-09-22 07:29:51','2026-09-21 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51'),(55,'INV-FINNOVA-2026-0003',56,23,55,'PAID',1499.00,74.95,0.00,1573.95,'2026-09-22 07:29:51','2026-09-21 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51'),(56,'INV-CREDNEST-2026-0001',57,24,56,'PAID',999.00,49.95,0.00,1048.95,'2026-09-22 07:29:52','2026-09-21 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52'),(57,'INV-CREDNEST-2026-0002',58,24,57,'PAID',4499.00,224.95,0.00,4723.95,'2026-09-22 07:29:52','2026-09-21 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52'),(58,'INV-CREDNEST-2026-0003',59,24,58,'PAID',999.00,49.95,0.00,1048.95,'2026-09-22 07:29:52','2026-09-21 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_interest`
--

DROP TABLE IF EXISTS `loan_interest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_interest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `calculation_date` datetime NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `is_paid` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_loan_interest_id` (`id`),
  KEY `ix_loan_interest_loan_id` (`loan_id`),
  CONSTRAINT `loan_interest_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_interest`
--

LOCK TABLES `loan_interest` WRITE;
/*!40000 ALTER TABLE `loan_interest` DISABLE KEYS */;
INSERT INTO `loan_interest` VALUES (56,56,'2026-09-12 07:29:50',4166.67,1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(57,57,'2026-09-12 07:29:51',9000.00,1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(58,58,'2026-09-12 07:29:51',6250.00,1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(59,59,'2026-09-12 07:29:52',3135.42,1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(60,60,'2026-09-12 07:29:52',16145.83,1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(61,61,'2026-09-12 07:29:52',12812.50,1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(62,62,'2026-09-27 07:56:54',2750.00,0,'2026-09-27 07:56:54','2026-09-27 07:56:54'),(63,63,'2026-09-27 11:18:34',2750.00,0,'2026-09-27 11:18:35','2026-09-27 11:18:35');
/*!40000 ALTER TABLE `loan_interest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_repayments`
--

DROP TABLE IF EXISTS `loan_repayments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_repayments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `principal_component` decimal(15,2) NOT NULL,
  `interest_component` decimal(15,2) NOT NULL,
  `repayment_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_loan_repayments_id` (`id`),
  KEY `ix_loan_repayments_loan_id` (`loan_id`),
  CONSTRAINT `loan_repayments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_repayments`
--

LOCK TABLES `loan_repayments` WRITE;
/*!40000 ALTER TABLE `loan_repayments` DISABLE KEYS */;
INSERT INTO `loan_repayments` VALUES (50,56,60000.00,55833.33,4166.67,'2026-09-12 07:29:50','2026-09-27 07:29:51','2026-09-27 07:29:51'),(51,57,150000.00,141000.00,9000.00,'2026-09-12 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51'),(52,58,70000.00,63750.00,6250.00,'2026-09-12 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51'),(53,59,50000.00,46864.58,3135.42,'2026-09-12 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52'),(54,60,300000.00,283854.17,16145.83,'2026-09-12 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52'),(55,61,180000.00,167187.50,12812.50,'2026-09-12 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52');
/*!40000 ALTER TABLE `loan_repayments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_account_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int NOT NULL,
  `finance_company_id` int NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `base_interest_rate` decimal(5,2) NOT NULL,
  `discount_rate` decimal(5,2) NOT NULL,
  `effective_interest_rate` decimal(5,2) NOT NULL,
  `term_months` int NOT NULL,
  `current_balance` decimal(15,2) NOT NULL,
  `total_interest_accrued` decimal(15,2) NOT NULL,
  `total_paid` decimal(15,2) NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disbursed_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `purpose` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_loans_loan_account_number` (`loan_account_number`),
  KEY `idx_loans_company_status` (`finance_company_id`,`status`),
  KEY `idx_loans_customer_status` (`customer_id`,`status`),
  KEY `ix_loans_customer_id` (`customer_id`),
  KEY `ix_loans_finance_company_id` (`finance_company_id`),
  KEY `ix_loans_id` (`id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`finance_company_id`) REFERENCES `finance_companies` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES (56,'LN-FINNOVA-00001',54,23,500000.00,10.50,0.50,10.00,24,440000.00,8333.33,60000.00,'ACTIVE','2026-08-13 07:29:50','2026-09-27 07:29:50','2026-09-27 07:29:50','Working Capital & Store Inventory'),(57,'LN-FINNOVA-00002',55,23,1200000.00,11.00,2.00,9.00,36,1050000.00,18000.00,150000.00,'ACTIVE','2026-08-13 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51','Commercial Machinery Purchase'),(58,'LN-FINNOVA-00003',56,23,750000.00,10.50,0.50,10.00,24,680000.00,9500.00,70000.00,'ACTIVE','2026-08-13 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51','Supply Chain Operations Financing'),(59,'LN-CREDNEST-00001',57,24,350000.00,11.50,0.75,10.75,18,300000.00,6270.83,50000.00,'ACTIVE','2026-08-13 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52','IT Hardware and Office Setup'),(60,'LN-CREDNEST-00002',58,24,2500000.00,10.25,2.50,7.75,36,2200000.00,32291.67,300000.00,'ACTIVE','2026-08-13 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52','Warehouse Logistics Expansion'),(61,'LN-CREDNEST-00003',59,24,1500000.00,11.00,0.75,10.25,24,1320000.00,18500.00,180000.00,'ACTIVE','2026-08-13 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52','Retail Store Franchise Expansion'),(62,'LN-2026-00007',54,23,300000.00,11.50,0.50,11.00,24,300000.00,2750.00,0.00,'ACTIVE','2026-09-27 07:56:54','2026-09-27 07:56:54','2026-09-27 07:56:54','MSME Expansion'),(63,'LN-2026-00008',54,23,300000.00,11.50,0.50,11.00,24,300000.00,2750.00,0.00,'ACTIVE','2026-09-27 11:18:34','2026-09-27 11:18:34','2026-09-27 11:18:34','MSME Expansion'),(64,'LN-2026-00009',66,23,50000.00,11.50,0.00,11.50,24,50000.00,0.00,0.00,'PENDING','2026-09-27 15:13:28','2026-09-27 15:13:28','2026-09-27 15:13:28','Working Capital & Inventory Procurement [Docs: ironman.jpg]');
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_customer_status` (`customer_id`,`status`),
  KEY `ix_notifications_customer_id` (`customer_id`),
  KEY `ix_notifications_id` (`id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (96,54,'Welcome to FinCore','Your account with FinNova Small Finance Bank is active. Your Basic Plan provides a 0.50% rate concession on your loan account.','SYSTEM','UNREAD','2026-09-27 07:29:51','2026-09-27 07:29:51'),(97,55,'Welcome to FinCore','Your account with FinNova Small Finance Bank is active. Your Premium Plan provides a 2.00% rate concession on your loan account.','SYSTEM','UNREAD','2026-09-27 07:29:51','2026-09-27 07:29:51'),(98,56,'Welcome to FinCore','Your account with FinNova Small Finance Bank is active. Your Basic Plan provides a 0.50% rate concession on your loan account.','SYSTEM','UNREAD','2026-09-27 07:29:51','2026-09-27 07:29:51'),(99,57,'Welcome to FinCore','Your account with CredNest Small Finance Bank is active. Your Basic Plan provides a 0.75% rate concession on your loan account.','SYSTEM','UNREAD','2026-09-27 07:29:52','2026-09-27 07:29:52'),(100,58,'Welcome to FinCore','Your account with CredNest Small Finance Bank is active. Your Premium Plan provides a 2.50% rate concession on your loan account.','SYSTEM','UNREAD','2026-09-27 07:29:52','2026-09-27 07:29:52'),(101,59,'Welcome to FinCore','Your account with CredNest Small Finance Bank is active. Your Basic Plan provides a 0.75% rate concession on your loan account.','SYSTEM','UNREAD','2026-09-27 07:29:52','2026-09-27 07:29:52'),(102,54,'Loan Application Received','Loan facility application LN-2026-00007 for ₹300,000.00 submitted. Status: Pending for Verification.','LOAN','UNREAD','2026-09-27 07:56:54','2026-09-27 07:56:54'),(103,54,'Loan Confirmed & Sanctioned','Your loan LN-2026-00007 for ₹300,000.00 has been verified and confirmed by the bank administrator!','LOAN','UNREAD','2026-09-27 07:56:54','2026-09-27 07:56:54'),(104,54,'Loan Application Received','Loan facility application LN-2026-00008 for ₹300,000.00 submitted. Status: Pending for Verification.','LOAN','UNREAD','2026-09-27 11:18:34','2026-09-27 11:18:34'),(105,54,'Loan Confirmed & Sanctioned','Your loan LN-2026-00008 for ₹300,000.00 has been verified and confirmed by the bank administrator!','LOAN','UNREAD','2026-09-27 11:18:35','2026-09-27 11:18:35'),(106,66,'Loan Application Received','Loan facility application LN-2026-00009 for ₹50,000.00 submitted. Status: Pending for Verification.','LOAN','UNREAD','2026-09-27 15:13:28','2026-09-27 15:13:28');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_accounts`
--

DROP TABLE IF EXISTS `oauth_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `provider` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_user_id` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_oauth_accounts_customer_id` (`customer_id`),
  KEY `ix_oauth_accounts_id` (`id`),
  KEY `ix_oauth_accounts_provider_user_id` (`provider_user_id`),
  CONSTRAINT `oauth_accounts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_accounts`
--

LOCK TABLES `oauth_accounts` WRITE;
/*!40000 ALTER TABLE `oauth_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_used` tinyint(1) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_otp_email_purpose` (`email`,`purpose`),
  KEY `ix_otp_verifications_email` (`email`),
  KEY `ix_otp_verifications_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
INSERT INTO `otp_verifications` VALUES (1,'verified.user.1790439903@example.com','511030','REGISTRATION',0,'2026-09-26 16:35:03','2026-09-26 16:25:04'),(2,'vsk@gmail.com','368618','REGISTRATION',1,'2026-09-26 16:38:14','2026-09-26 16:28:14'),(3,'vsk@gmail.com','816192','REGISTRATION',1,'2026-09-26 16:44:16','2026-09-26 16:34:16'),(4,'9820011223','724307','MOBILE_LOGIN',1,'2026-09-26 16:53:43','2026-09-26 16:43:43'),(5,'9876543211','267498','MOBILE_LOGIN',1,'2026-09-26 16:53:43','2026-09-26 16:43:44'),(6,'9820011223','103178','MOBILE_LOGIN',1,'2026-09-26 17:02:04','2026-09-26 16:52:04'),(7,'9876543211','790646','MOBILE_LOGIN',1,'2026-09-26 17:02:04','2026-09-26 16:52:04'),(8,'verified.user.1790485937@example.com','900160','REGISTRATION',0,'2026-09-27 05:22:18','2026-09-27 05:12:18'),(9,'9820011223','418160','MOBILE_LOGIN',1,'2026-09-27 05:23:50','2026-09-27 05:13:50'),(10,'9876543210','301261','MOBILE_LOGIN',1,'2026-09-27 05:23:50','2026-09-27 05:13:50'),(11,'verified.user.1790486195@example.com','653845','REGISTRATION',0,'2026-09-27 05:26:36','2026-09-27 05:16:36'),(12,'verified.user.1790486212@example.com','389668','REGISTRATION',0,'2026-09-27 05:26:52','2026-09-27 05:16:52'),(13,'vsk@gmail.com','418052','REGISTRATION',1,'2026-09-27 05:29:14','2026-09-27 05:19:14'),(14,'vsk@gmail.com','333324','REGISTRATION',1,'2026-09-27 05:29:36','2026-09-27 05:19:36'),(16,'9154286521','236766','MOBILE_LOGIN',0,'2026-09-27 05:44:24','2026-09-27 05:34:24'),(17,'9876543211','722964','MOBILE_LOGIN',0,'2026-09-27 05:51:23','2026-09-27 05:41:23'),(18,'verified.user.1790488930@example.com','748431','REGISTRATION',1,'2026-09-27 06:12:11','2026-09-27 06:02:11'),(19,'vskt@gmail.com','632981','REGISTRATION',0,'2026-09-27 06:15:05','2026-09-27 06:05:05'),(20,'9876543210','310893','MOBILE_LOGIN',1,'2026-09-27 06:15:28','2026-09-27 06:05:28'),(21,'9876543210','385056','MOBILE_LOGIN',0,'2026-09-27 06:32:20','2026-09-27 06:22:20'),(23,'verified.user.1790491762@example.com','952039','REGISTRATION',0,'2026-09-27 06:59:23','2026-09-27 06:49:23'),(24,'verified.user.1790491784@example.com','901519','REGISTRATION',1,'2026-09-27 06:59:44','2026-09-27 06:49:44'),(25,'verified.user.1790491809@example.com','387644','REGISTRATION',1,'2026-09-27 07:00:10','2026-09-27 06:50:10'),(28,'9820011223','463343','MOBILE_LOGIN',0,'2026-09-27 07:14:17','2026-09-27 07:04:17'),(29,'9820011223','563573','REGISTRATION',0,'2026-09-27 07:15:25','2026-09-27 07:05:25'),(31,'verified.user.1790494161@example.com','686316','REGISTRATION',1,'2026-09-27 07:39:21','2026-09-27 07:29:21'),(32,'aarav.sharma@gmail.com','272393','GMAIL_LOGIN',1,'2026-09-27 07:54:12','2026-09-27 07:44:12'),(33,'aarav.sharma@gmail.com','463559','GMAIL_LOGIN',1,'2026-09-27 08:06:24','2026-09-27 07:56:24'),(34,'admin@finnova.in','740403','GMAIL_LOGIN',1,'2026-09-27 08:06:38','2026-09-27 07:56:38'),(35,'aarav.sharma@gmail.com','815620','GMAIL_LOGIN',0,'2026-09-27 11:28:23','2026-09-27 11:18:23'),(36,'admin@finnova.in','480589','GMAIL_LOGIN',1,'2026-09-27 11:28:29','2026-09-27 11:18:29'),(37,'admin@finnova.in','543788','GMAIL_LOGIN',1,'2026-09-27 11:39:32','2026-09-27 11:29:32'),(38,'admin@crednest.in','440209','GMAIL_LOGIN',0,'2026-09-27 11:41:43','2026-09-27 11:31:43'),(40,'admin@finnova.in','365848','GMAIL_LOGIN',1,'2026-09-27 11:47:44','2026-09-27 11:37:44'),(42,'vsk@gmail.com','668758','REGISTRATION',0,'2026-09-27 13:02:19','2026-09-27 12:52:19'),(44,'venkatsaikrishnatupakula5@gmail.com','535245','REGISTRATION',1,'2026-09-27 13:09:12','2026-09-27 12:59:12'),(45,'tupakula03@gmail.com','755585','REGISTRATION',1,'2026-09-27 13:11:42','2026-09-27 13:01:42'),(46,'tupakulaarunsri03@gmail.com','220379','REGISTRATION',0,'2026-09-27 13:14:05','2026-09-27 13:04:06'),(47,'venkatsaikrishnatupakula5@gmail.com','549178','REGISTRATION',1,'2026-09-27 13:16:14','2026-09-27 13:06:14'),(48,'tupakulaarunasri03@gmail.com','724281','REGISTRATION',1,'2026-09-27 13:18:05','2026-09-27 13:08:05'),(49,'tupakulaarunasri03@gmail.com','737263','REGISTRATION',1,'2026-09-27 13:19:24','2026-09-27 13:09:24'),(50,'tupakulaarunasri03@gmail.com','349614','REGISTRATION',0,'2026-09-27 13:20:45','2026-09-27 13:10:45'),(51,'venkatsaikrishnatupakula5@gmail.com','433089','REGISTRATION',1,'2026-09-27 13:21:33','2026-09-27 13:11:33'),(52,'venkatsaikrishnatupakula5@gmail.com','721945','REGISTRATION',1,'2026-09-27 15:17:59','2026-09-27 15:07:59'),(53,'krishnakumaritupakula2826@gmail.com','919603','REGISTRATION',1,'2026-09-27 15:21:37','2026-09-27 15:11:37'),(54,'admin@finnova.in','119754','GMAIL_LOGIN',1,'2026-09-27 15:23:57','2026-09-27 15:13:57'),(55,'admin@finnova.in','845694','GMAIL_LOGIN',0,'2026-09-27 15:36:08','2026-09-27 15:26:08'),(56,'venkatsaikrishnatupakula5@gmail.com','157625','REGISTRATION',0,'2026-09-27 15:36:13','2026-09-27 15:26:13');
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `gateway_transaction_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_response` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_payment_transactions_id` (`id`),
  KEY `ix_payment_transactions_payment_id` (`payment_id`),
  CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_reference` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_payments_payment_reference` (`payment_reference`),
  KEY `idx_payments_customer_status` (`customer_id`,`status`),
  KEY `idx_payments_invoice` (`invoice_id`),
  KEY `ix_payments_customer_id` (`customer_id`),
  KEY `ix_payments_id` (`id`),
  KEY `ix_payments_invoice_id` (`invoice_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (53,'PAY-FINNOVA-0001',53,54,1573.95,'SUCCESS','UPI / NET_BANKING','2026-09-21 07:29:50','2026-09-27 07:29:50','2026-09-27 07:29:50'),(54,'PAY-FINNOVA-0002',54,55,4198.95,'SUCCESS','UPI / NET_BANKING','2026-09-21 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51'),(55,'PAY-FINNOVA-0003',55,56,1573.95,'SUCCESS','UPI / NET_BANKING','2026-09-21 07:29:51','2026-09-27 07:29:51','2026-09-27 07:29:51'),(56,'PAY-CREDNEST-0001',56,57,1048.95,'SUCCESS','UPI / NET_BANKING','2026-09-21 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52'),(57,'PAY-CREDNEST-0002',57,58,4723.95,'SUCCESS','UPI / NET_BANKING','2026-09-21 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52'),(58,'PAY-CREDNEST-0003',58,59,1048.95,'SUCCESS','UPI / NET_BANKING','2026-09-21 07:29:52','2026-09-27 07:29:52','2026-09-27 07:29:52');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_features`
--

DROP TABLE IF EXISTS `plan_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_features` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `feature_key` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feature_label` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_included` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_plan_features_id` (`id`),
  KEY `ix_plan_features_plan_id` (`plan_id`),
  CONSTRAINT `plan_features_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_features`
--

LOCK TABLES `plan_features` WRITE;
/*!40000 ALTER TABLE `plan_features` DISABLE KEYS */;
INSERT INTO `plan_features` VALUES (141,42,'gst_invoicing','Automated GST Compliant Invoicing',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(142,42,'support','Priority Business Banking Support',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(143,42,'rate_discount','0.50% Loan Interest Concession',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(144,42,'audit_logs','Real-time Tax Filing Statement Exports',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(145,43,'unlimited_invoices','Unlimited Itemized Invoicing',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(146,43,'rm_support','Dedicated Senior Relationship Manager',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(147,43,'rate_discount','2.00% Significant Loan Rate Concession',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(148,43,'instant_disbursal','Fast-Track Capital Disbursals',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(149,44,'msme_fasttrack','Fast-Track Trade Credit Sanction',1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(150,44,'rate_discount','0.75% Interest Rate Concession',1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(151,44,'gst_portal','GST Reconciliation Reports',1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(152,45,'high_cap','High-Cap Sanction Allowance (Up to ₹50 Lakhs)',1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(153,45,'rate_discount','2.50% Maximum Interest Concession',1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(154,45,'dedicated_desk','24/7 Corporate Lending Desk',1,'2026-09-27 07:29:52','2026-09-27 07:29:52');
/*!40000 ALTER TABLE `plan_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `finance_company_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `billing_cycle` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `interest_discount_rate` decimal(5,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_plan_code` (`finance_company_id`,`code`),
  KEY `ix_plans_finance_company_id` (`finance_company_id`),
  KEY `ix_plans_id` (`id`),
  CONSTRAINT `plans_ibfk_1` FOREIGN KEY (`finance_company_id`) REFERENCES `finance_companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (42,23,'Basic Plan','FN-GROWTH','Essential digital banking, automated GST invoicing, and competitive loan concessions.',1499.00,'monthly',0.50,1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(43,23,'Premium Plan','FN-ELITE','Unlimited invoice processing, dedicated relationship manager, and maximum rate concessions.',3999.00,'monthly',2.00,1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(44,24,'Basic Plan','CN-CATALYST','Tailored for micro-enterprises, retail businesses, and fast-turnaround trade financing.',999.00,'monthly',0.75,1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(45,24,'Premium Plan','CN-SCALE','High-capital credit line sanctions and multi-user corporate treasury services.',4499.00,'monthly',2.50,1,'2026-09-27 07:29:51','2026-09-27 07:29:51');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `auto_renew` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_customer_status` (`customer_id`,`status`),
  KEY `ix_subscriptions_customer_id` (`customer_id`),
  KEY `ix_subscriptions_id` (`id`),
  KEY `ix_subscriptions_plan_id` (`plan_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (53,54,42,'active','2026-09-17 07:29:50','2026-10-17 07:29:50',1,'2026-09-27 07:29:50','2026-09-27 07:29:50'),(54,55,43,'active','2026-09-17 07:29:51','2026-10-17 07:29:51',1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(55,56,42,'active','2026-09-17 07:29:51','2026-10-17 07:29:51',1,'2026-09-27 07:29:51','2026-09-27 07:29:51'),(56,57,44,'active','2026-09-17 07:29:52','2026-10-17 07:29:52',1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(57,58,45,'active','2026-09-17 07:29:52','2026-10-17 07:29:52',1,'2026-09-27 07:29:52','2026-09-27 07:29:52'),(58,59,44,'active','2026-09-17 07:29:52','2026-10-17 07:29:52',1,'2026-09-27 07:29:52','2026-09-27 07:29:52');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `view_company_revenue_analytics`
--

DROP TABLE IF EXISTS `view_company_revenue_analytics`;
/*!50001 DROP VIEW IF EXISTS `view_company_revenue_analytics`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_company_revenue_analytics` AS SELECT 
 1 AS `company_id`,
 1 AS `company_name`,
 1 AS `total_customers`,
 1 AS `active_subscriptions`,
 1 AS `total_revenue_collected`,
 1 AS `total_interest_accrued`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_customer_financial_summary`
--

DROP TABLE IF EXISTS `view_customer_financial_summary`;
/*!50001 DROP VIEW IF EXISTS `view_customer_financial_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_customer_financial_summary` AS SELECT 
 1 AS `customer_id`,
 1 AS `email`,
 1 AS `full_name`,
 1 AS `finance_company_name`,
 1 AS `active_subscriptions`,
 1 AS `total_invoiced_paid`,
 1 AS `total_invoiced_pending`,
 1 AS `total_loan_outstanding`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'fincore_db'
--

--
-- Current Database: `fincore_db`
--

USE `fincore_db`;

--
-- Final view structure for view `view_company_revenue_analytics`
--

/*!50001 DROP VIEW IF EXISTS `view_company_revenue_analytics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_company_revenue_analytics` AS select `fc`.`id` AS `company_id`,`fc`.`name` AS `company_name`,count(distinct `c`.`id`) AS `total_customers`,count(distinct `s`.`id`) AS `active_subscriptions`,coalesce(sum(`p`.`amount`),0) AS `total_revenue_collected`,coalesce(sum(`l`.`total_interest_accrued`),0) AS `total_interest_accrued` from (((((`finance_companies` `fc` left join `customers` `c` on((`fc`.`id` = `c`.`finance_company_id`))) left join `subscriptions` `s` on(((`c`.`id` = `s`.`customer_id`) and (`s`.`status` = 'active')))) left join `invoices` `i` on((`fc`.`id` = `i`.`finance_company_id`))) left join `payments` `p` on(((`i`.`id` = `p`.`invoice_id`) and (`p`.`status` = 'SUCCESS')))) left join `loans` `l` on((`fc`.`id` = `l`.`finance_company_id`))) group by `fc`.`id`,`fc`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_customer_financial_summary`
--

/*!50001 DROP VIEW IF EXISTS `view_customer_financial_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_customer_financial_summary` AS select `c`.`id` AS `customer_id`,`c`.`email` AS `email`,concat(`c`.`first_name`,' ',`c`.`last_name`) AS `full_name`,`fc`.`name` AS `finance_company_name`,coalesce(count(distinct `s`.`id`),0) AS `active_subscriptions`,coalesce(sum(distinct (case when (`i`.`status` = 'PAID') then `i`.`total_amount` else 0 end)),0) AS `total_invoiced_paid`,coalesce(sum(distinct (case when (`i`.`status` in ('ISSUED','PENDING','OVERDUE')) then `i`.`total_amount` else 0 end)),0) AS `total_invoiced_pending`,coalesce(sum(distinct `l`.`current_balance`),0) AS `total_loan_outstanding` from ((((`customers` `c` join `finance_companies` `fc` on((`c`.`finance_company_id` = `fc`.`id`))) left join `subscriptions` `s` on(((`c`.`id` = `s`.`customer_id`) and (`s`.`status` = 'active')))) left join `invoices` `i` on((`c`.`id` = `i`.`customer_id`))) left join `loans` `l` on(((`c`.`id` = `l`.`customer_id`) and (`l`.`status` = 'ACTIVE')))) group by `c`.`id`,`c`.`email`,`c`.`first_name`,`c`.`last_name`,`fc`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-27 20:56:39
