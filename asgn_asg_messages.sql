-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: 104.237.154.206    Database: asgn
-- ------------------------------------------------------
-- Server version	5.7.18-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `asg_messages`
--

DROP TABLE IF EXISTS `asg_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asg_messages` (
  `mid` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) DEFAULT NULL,
  `gid` int(11) DEFAULT NULL,
  `message` text,
  `type` char(10) DEFAULT 'text',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`mid`),
  KEY `gid` (`gid`),
  KEY `uid` (`uid`),
  CONSTRAINT `asg_messages_ibfk_1` FOREIGN KEY (`gid`) REFERENCES `asg_groups` (`gid`),
  CONSTRAINT `asg_messages_ibfk_2` FOREIGN KEY (`uid`) REFERENCES `asg_users` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asg_messages`
--

LOCK TABLES `asg_messages` WRITE;
/*!40000 ALTER TABLE `asg_messages` DISABLE KEYS */;
INSERT INTO `asg_messages` VALUES (1,1,3,'cool site','text','2017-12-09 06:52:18','2017-12-09 06:52:18'),(2,1,4,'okay','text','2017-12-09 06:52:31','2017-12-09 06:52:31'),(3,1,4,'???','text','2017-12-09 06:52:59','2017-12-09 06:52:59'),(4,1,3,'uploads/2017-12-09/e0f3ed18-8697-4440-ae1d-491b4d1970ec.png','image','2017-12-09 06:54:42','2017-12-09 06:54:42'),(5,1,2,'uploads/2017-12-09/f188097d-47ce-4143-9a89-0f241f61f2ca.jpg','image','2017-12-09 06:55:50','2017-12-09 06:55:50'),(6,2,3,'nice image','text','2017-12-09 06:56:41','2017-12-09 06:56:41'),(7,2,3,'wow','text','2017-12-09 06:56:54','2017-12-09 06:56:54');
/*!40000 ALTER TABLE `asg_messages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-12-09 12:28:53
