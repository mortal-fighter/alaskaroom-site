/*
SQLyog Community v12.2.4 (64 bit)
MySQL - 5.5.25 : Database - onemarkt_alaskaroom
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`onemarkt_alaskaroom` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `onemarkt_alaskaroom`;

/*Table structure for table `access_token` */

DROP TABLE IF EXISTS `access_token`;

CREATE TABLE `access_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `access_token` varchar(50) NOT NULL,
  `expires_in` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `vk_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8;

/*Data for the table `access_token` */

insert  into `access_token`(`id`,`access_token`,`expires_in`,`user_id`,`date_created`,`vk_id`) values 
(20,'51cc0b6bb203898c51febf77f8f18bb812e9e0973716a5c17a',86399,NULL,'2017-12-01 21:53:24',16718732),
(21,'901a6f6a43441039d666e15af198533ef9e4f05e0709ab9bd1',86400,NULL,'2017-12-01 21:58:25',16718732),
(22,'7e02e40e2d89d6a4241b9df20ff51a2ace0bde06f6a1ba3d32',86396,NULL,'2017-12-01 22:00:10',16718732),
(23,'0aaf37044d73d4584b9fdf26c361b4426592d64ce33efb8622',86399,NULL,'2017-12-02 19:57:11',16718732),
(24,'6460d53d9c16ce70d40c43f5d983187550603823b5b796b5f8',86399,NULL,'2017-12-02 19:58:38',16718732),
(25,'dc613d2e7354b759014cea038f857a447bbe2bba1c0b229b4c',86400,NULL,'2017-12-02 19:58:51',16718732),
(26,'9c40ab91e8a3ad2183893643c3f3ff098dd01d2787d528420b',86400,NULL,'2017-12-02 19:59:08',16718732),
(27,'b0643b8927dc42ffc97bf7c295825252c68a4ac4c2bdf5fa39',86400,NULL,'2017-12-02 20:12:16',16718732),
(28,'7b7b674c404ae5d8aac67f8f8efd19c3728d046b99dc93cd0a',86399,NULL,'2017-12-02 20:30:45',16718732),
(29,'31a65eee68d9ea91ba6d4d2d658da114cd5774939c14212349',86400,NULL,'2017-12-02 20:31:26',16718732),
(30,'5dd98cd573c83b0c71fc55a7edda43ada69510cc7fa714ba70',86400,NULL,'2017-12-02 20:31:58',16718732),
(31,'14de568be55e79336f2c1ab759bf6e1bbdc8f4a0dc9aa5b30a',86400,NULL,'2017-12-02 20:33:01',16718732),
(32,'6500957b333f7bc1b71a9849b755e3c0646af99b07c5c1da28',86400,NULL,'2017-12-02 22:09:33',16718732),
(33,'8bb21686696c687f7cf580bc05fd45ec1ff2f96451f7a9c5f5',86400,NULL,'2017-12-03 12:19:19',16718732),
(34,'957a9d74c944c161f48ceeb09521d3d9a62f8786268f4d14b1',86400,NULL,'2017-12-03 13:20:12',16718732),
(35,'d99bccc81a93df9a0d6ed5102b448c6a410f742cc59117a208',86400,NULL,'2017-12-03 13:21:58',16718732),
(36,'9594c93e1bb54675e9c5db369ef42344d695b4228866e4cdb4',86400,NULL,'2017-12-03 13:23:35',16718732),
(37,'08ee91c14ae6e482f64aa7715fc2972f3f15b54eefda41decc',86399,NULL,'2017-12-03 13:23:50',16718732),
(38,'c68701332271c6f145d1d75cf68d3367b406cbd31601f658e7',86400,NULL,'2017-12-03 14:27:20',16718732),
(39,'df7fb5acc50bbd62c79e1a37614a7ffcdf53ed55cc502d4185',86399,NULL,'2017-12-03 14:34:05',16718732),
(40,'10b8fef3f013a9e69595041faca85c034ee3cc610a1c9a6558',86400,NULL,'2017-12-03 14:54:59',16718732),
(41,'3390b4c9baa5be51897fdfde86b4b3fadfb410aba0aabb216e',86399,NULL,'2017-12-03 14:57:44',16718732),
(42,'df37cc88243386b73ed3ea07cac1b5bfd5387e58aacf6465b1',86399,NULL,'2017-12-03 14:57:59',16718732),
(43,'b2f32a19a712fc315445305587a5af15870c0c9de7df6387ed',86400,NULL,'2017-12-03 14:59:51',16718732),
(44,'bb2c5759f7e9f2607e3ef5151b683a44ad268042014caa16c3',86399,NULL,'2017-12-03 15:01:13',16718732),
(45,'9c3af12beebad1a9ad502905f66e69462ffcc0d958ad00198d',86399,NULL,'2017-12-03 15:02:41',16718732),
(46,'dc630059619981dac300acfd91da660f5debf2f54f890ae858',86399,NULL,'2017-12-03 15:03:31',16718732),
(47,'0836cc5df5bd872c2aa3f1026abce70c4513af64832a9e9eb6',86399,NULL,'2017-12-03 15:15:16',16718732),
(48,'ce1ef5767e1e20e5643fd60d8486a5eb989e27a5615b78bae8',86400,NULL,'2017-12-03 15:15:44',16718732),
(49,'990ca03dad0cf2fbc376402f0a4825323585f99639a16f52cf',86400,NULL,'2017-12-03 15:16:33',16718732),
(50,'540c692b7a2450245c5fed0854f2353fd497439bd21db1b46d',86399,NULL,'2017-12-03 15:27:12',16718732),
(51,'0ef228174af6d7234683562f76337061900add2a1381d2dcde',86400,NULL,'2017-12-03 15:37:57',16718732),
(52,'12c2238386393f704a33e9c30bfd17ea46e9d58181f26bd718',86400,NULL,'2017-12-03 15:39:12',16718732),
(53,'f86036c78aae862be3d87ff236ff6a9189ba2864de6597c219',86400,NULL,'2017-12-03 15:41:37',16718732),
(54,'f1e0a0ee0ff8b2766bd1fbfc47985152a693e6ac30bbf98472',86400,NULL,'2017-12-03 15:42:47',16718732),
(55,'9149dbc308a1018ec7a3064e4bd1b0e112ae2d79a30d0a3c53',86400,NULL,'2017-12-03 15:56:37',16718732),
(56,'4720387534619fbb3ae90892e40952f646c19f3b72d0294074',86400,NULL,'2017-12-03 16:01:12',16718732),
(57,'ef3c6d5a57683d35fc6dd40cf59a3051a253cd17660b3bc6fa',86400,NULL,'2017-12-04 01:35:54',16718732),
(58,'c83bdf93b20c86a1f2ac09a0dc824cfb88f05b645cf6a2ca43',86400,NULL,'2017-12-04 12:43:04',16718732),
(59,'46c239147c2a02dc1c2fb05887624e6079fd0878948aa3ce67',86400,NULL,'2017-12-04 22:15:25',16718732),
(60,'8bab2d07d9495e31b72c85a72c894c6bfdccbd96f7cef4f797',86400,NULL,'2017-12-05 00:05:27',16718732),
(61,'121b15cc95fee4025ec378ec5a59ece6e892173335c32f21de',86400,NULL,'2017-12-05 01:21:21',16718732),
(62,'1d8d939592004115328bd2ec905f9982d021487dd94fa6242c',86400,NULL,'2017-12-05 01:21:53',16718732),
(63,'22c81260fc7f1591eb61f705669d2114d83ca9324d4a47a160',86400,NULL,'2017-12-05 10:30:00',16718732),
(64,'f6e99bc80eec8dbfef460fb9f41098d6f4db72a139a490d272',86400,NULL,'2017-12-05 12:00:34',16718732),
(65,'dcff7d28b7fafcd04f06211b847180b4dc50945470527f977a',86400,NULL,'2017-12-05 13:48:52',16718732),
(66,'56c6efbbdabe46d531211ee9b07100c51b302fb353a36fdab8',86400,NULL,'2017-12-05 14:02:08',16718732),
(67,'3c49bc76abbf5f1830044349c5a3dda7a890be7cd02f8c5b86',86400,NULL,'2017-12-05 18:47:45',16718732),
(68,'e7f19666e2d497cd4745cadb413ae414c2367311bc912a80be',86399,NULL,'2017-12-06 12:15:46',16718732),
(69,'74ddf2c4951799014627c39ae6caabc0b9786845421c108251',86400,NULL,'2017-12-06 22:30:10',16718732),
(70,'5d7640df9fb9dc55aa3768e5762ce48a6fb60979abce18734d',86389,NULL,'2017-12-07 11:52:03',16718732),
(71,'b6fde6c24e3a8728c2e1088a4dab2e5bd3a0b4d50f16285a28',86400,NULL,'2017-12-07 12:40:41',16718732),
(72,'bb061a8af3b1d7551f40f85232e7491c990cedcd415c3970e7',86400,NULL,'2017-12-07 12:41:53',16718732),
(73,'5e33004b3321a7f2d9ddf9f2ea70f1d98b4e62ca2d078add7b',86351,NULL,'2017-12-07 21:38:02',16718732),
(74,'c840f8126f808de7b2fbc8cac8f42d572c42d72d086aa402eb',86399,NULL,'2017-12-07 22:35:31',16718732),
(75,'5c848fbd31546e466fa267ebd10dab9798108c905d018365f5',86399,NULL,'2017-12-08 02:18:26',16718732),
(76,'360d796aa9f1983801cfcc5976413760be54f1cc5aaa11db56',86399,NULL,'2017-12-08 02:54:45',16718732),
(77,'1978aa99079f98395efd67046e7bf896e04359f0158a45cdab',86400,NULL,'2017-12-08 10:13:19',16718732),
(78,'c104f81bb95a9267b0917c82bf95e2662098dcbd5b5951380a',86400,NULL,'2017-12-08 10:44:21',16718732),
(79,'60b937a8ca67b5f751e15af13d6edd80445af9a676a1176d92',86400,NULL,'2017-12-08 13:23:44',16718732),
(80,'edb20cb5654f2fc94420467cca5f3bc45dce3fa87d441dee1a',86329,NULL,'2017-12-09 00:15:19',16718732),
(81,'1b50212c1c8dfae4df13a5f4e0c5063ac40f2ae8349990e542',86399,NULL,'2017-12-09 00:15:19',16718732),
(82,'1e51c058bfa8764f9eb5f82f1fb7d830c82c8c307c8051cf88',86382,NULL,'2017-12-09 11:50:33',16718732),
(83,'4b6fd123d4fa3ead02f317c6688c9b564b029cffad2ec4875f',86399,NULL,'2017-12-09 21:06:53',16718732),
(84,'1645350eec518e04297b081e1b18b080d09e9249d952d07c9e',86395,NULL,'2017-12-10 11:46:39',16718732),
(85,'53a7ab87f3cdf8f3591210840ae6ed5fc85f49999ab090527e',86400,NULL,'2017-12-10 12:03:28',16718732),
(86,'aa75e9d48379ba56bc7d0715f4239ea9912437be4190d06287',86399,NULL,'2017-12-10 18:44:14',16718732),
(87,'ae60b07c0bb76ad364cae3b053b042d290bfb05bbceae99661',86399,NULL,'2017-12-10 23:48:36',16718732),
(88,'b63b29d857fc8986de08229741ebb14f9806d5be7460a87156',86399,NULL,'2017-12-11 06:22:10',16718732),
(89,'81234cb50dc5ddc8db2c323cce9fd88e1c547cb9fb650aa088',86399,NULL,'2017-12-11 14:48:28',16718732),
(90,'5d60ffc4a5e5610063f57fe72442ba4d92f0eafd8d440a4eef',86400,NULL,'2017-12-11 15:31:10',16718732),
(91,'1ddbe427371dff5ad3c7d62c27abaeba8ec00ecb551ff11450',86400,NULL,'2017-12-11 20:58:32',16718732),
(92,'3187ad22610c23891943f6e747aa1f5d4778d23131bcc3f335',86399,NULL,'2017-12-12 22:14:29',16718732),
(93,'8add629dc42660ce8344b3e5202fca0b228f732a874158d9bc',86400,NULL,'2017-12-13 01:21:36',16718732),
(94,'90b54d9408344cd1ba94a26f8243f115b1fbe17543cce88e98',86399,NULL,'2017-12-13 01:22:19',16718732),
(95,'4d3ec2dbde81c9e5e7c94b5e3dcad9e1265ad44f80bc4f1239',86400,NULL,'2017-12-13 01:28:57',16718732),
(96,'e0e6b002d42baddab08fd49946027de515f417ff40c1f6a8e0',86399,NULL,'2017-12-13 12:40:38',16718732),
(97,'03f828287cd28132a7b8364712320246f2334338695dd8d3c1',86400,NULL,'2017-12-13 14:37:49',16718732),
(98,'938cf8c8020439066852f371d9c0cc4d58f659549403218b0f',86400,NULL,'2017-12-13 20:50:34',16718732),
(99,'4b5238e06f1ba4ea1f5ae4f2b21f594c95d4820231c69660f0',86392,NULL,'2017-12-14 15:55:28',16718732),
(100,'2cc72fa8274d1d7d5c08ebb179816c819f7ef0c3defeb76a6e',86382,NULL,'2017-12-15 13:36:45',16718732),
(101,'bf91d2660c87bfa84a8378fe56ee21b80037199a73f3f97c01',86399,NULL,'2017-12-15 14:24:33',16718732);

/*Table structure for table `complain` */

DROP TABLE IF EXISTS `complain`;

CREATE TABLE `complain` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Data for the table `complain` */

insert  into `complain`(`id`,`name`) values 
(1,'Рекламное агентство'),
(2,'Не студент');

/*Table structure for table `flat` */

DROP TABLE IF EXISTS `flat`;

CREATE TABLE `flat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(200) DEFAULT NULL,
  `address` varchar(200) NOT NULL,
  `square` varchar(50) NOT NULL,
  `room_num` int(11) NOT NULL,
  `traffic` varchar(300) NOT NULL,
  `rent_pay` int(11) NOT NULL,
  `total_pay` int(11) NOT NULL,
  `enter_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8;

/*Data for the table `flat` */

insert  into `flat`(`id`,`description`,`address`,`square`,`room_num`,`traffic`,`rent_pay`,`total_pay`,`enter_date`) values 
(21,'Описание','Адрес','400 м2',20,'транспорт',3000,6000,'2017-12-11'),
(25,'описание1','адрес1','площадь1',2,'транспорт1',1000,2000,'0000-00-00'),
(26,'описание2','адрес2','площадь2',2,'транспорт2',1500,3000,'0000-00-00'),
(31,'описание','адрес','56 кв. м.',3,'94, 96',3000,6000,'2017-12-09'),
(32,'описание','адрес','56кв.м.',3,'94, 96',3000,6000,'2017-12-09'),
(33,'описание','адрес','56 кв. м.',3,'94, 96',3000,6000,'2017-12-09'),
(34,'самая уютная квартира на свете','адрес','56 кв',3,'94, 96 автобус',3000,6000,'2017-12-09');

/*Table structure for table `flat_utility` */

DROP TABLE IF EXISTS `flat_utility`;

CREATE TABLE `flat_utility` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `flat_id` int(11) NOT NULL,
  `utility_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;

/*Data for the table `flat_utility` */

insert  into `flat_utility`(`id`,`flat_id`,`utility_id`) values 
(4,34,1),
(5,34,1),
(6,34,5),
(7,34,1),
(8,34,5),
(18,21,1),
(19,21,4),
(20,21,1),
(21,21,4),
(22,34,1),
(23,34,5),
(24,34,1),
(25,34,5),
(26,34,1),
(27,34,5),
(28,21,1),
(29,21,4),
(30,21,1),
(31,21,4),
(32,34,1),
(33,34,5),
(34,21,1),
(35,21,4),
(36,34,1),
(37,34,5);

/*Table structure for table `photo` */

DROP TABLE IF EXISTS `photo`;

CREATE TABLE `photo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `src_small` varchar(200) DEFAULT NULL,
  `src_orig` varchar(200) NOT NULL,
  `filename_small` varchar(100) DEFAULT NULL,
  `filename_orig` varchar(100) NOT NULL,
  `width_small` int(11) DEFAULT NULL,
  `height_small` int(11) DEFAULT NULL,
  `width_orig` int(11) NOT NULL,
  `height_orig` int(11) NOT NULL,
  `flat_id` int(11) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `temporary_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

/*Data for the table `photo` */

insert  into `photo`(`id`,`src_small`,`src_orig`,`filename_small`,`filename_orig`,`width_small`,`height_small`,`width_orig`,`height_orig`,`flat_id`,`date_created`,`date_updated`,`temporary_user_id`) values 
(12,'/images/uploads/user_19/1512847436518.jpg','/images/uploads/user_19/1512847436518.jpg','1512847436518.jpg','1512847436518.jpg',1412,1438,1412,1438,0,'2017-12-09 22:23:56','2017-12-09 22:23:56',NULL),
(13,'/images/uploads/user_19/1512848039926.jpg','/images/uploads/user_19/1512848039926.jpg','1512848039926.jpg','1512848039926.jpg',822,800,822,800,0,'2017-12-09 22:33:59','2017-12-09 22:33:59',NULL),
(14,'/images/uploads/user_19/1512848071858.jpg','/images/uploads/user_19/1512848071858.jpg','1512848071858.jpg','1512848071858.jpg',822,800,822,800,0,'2017-12-09 22:34:31','2017-12-09 22:34:31',NULL),
(15,'/images/uploads/user_19/1512849323753.jpg','/images/uploads/user_19/1512849323753.jpg','1512849323753.jpg','1512849323753.jpg',1412,1438,1412,1438,34,'2017-12-09 22:55:23','2017-12-09 22:55:23',NULL),
(16,'/images/uploads/user_19/1512896716341.jpg','/images/uploads/user_19/1512896716341.jpg','1512896716341.jpg','1512896716341.jpg',1024,682,1024,682,34,'2017-12-10 12:05:16','2017-12-10 12:05:16',NULL),
(17,'/images/uploads/user_19/1512896720572.jpg','/images/uploads/user_19/1512896720572.jpg','1512896720572.jpg','1512896720572.jpg',1024,682,1024,682,34,'2017-12-10 12:05:20','2017-12-10 12:05:20',NULL),
(18,'/images/uploads/user_19/1512896724040.jpg','/images/uploads/user_19/1512896724040.jpg','1512896724040.jpg','1512896724040.jpg',1024,682,1024,682,34,'2017-12-10 12:05:24','2017-12-10 12:05:24',NULL),
(19,'/images/uploads/user_19/1512896728650.jpg','/images/uploads/user_19/1512896728650.jpg','1512896728650.jpg','1512896728650.jpg',1024,682,1024,682,34,'2017-12-10 12:05:28','2017-12-10 12:05:28',NULL),
(20,'/images/uploads/user_19/1512941196664.jpg','/images/uploads/user_19/1512941196664.jpg','1512941196664.jpg','1512941196664.jpg',275,183,275,183,21,'2017-12-11 00:26:36','2017-12-11 00:26:36',NULL),
(21,'/images/uploads/user_19/1512986131106.jpg','/images/uploads/user_19/1512986131106.jpg','1512986131106.jpg','1512986131106.jpg',620,413,620,413,34,'2017-12-11 12:55:31','2017-12-11 12:55:31',NULL),
(22,'/images/uploads/user_19/1513341271142.jpg','/images/uploads/user_19/1513341271142.jpg','1513341271142.jpg','1513341271142.jpg',1366,768,1366,768,NULL,'2017-12-15 15:34:31','2017-12-15 15:34:31',19);

/*Table structure for table `post` */

DROP TABLE IF EXISTS `post`;

CREATE TABLE `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('find-flat','find-roommate') NOT NULL,
  `enter_date` varchar(50) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `user_sex` enum('мужской','женский','не важно') DEFAULT NULL,
  `user_activity` enum('интроверт','экстраверт','не важно') DEFAULT NULL,
  `user_badhabbits` enum('курение','алкоголь','алкоголь и курение','нет','не важно') DEFAULT NULL,
  `user_pets` enum('небольшие только','не важно','обожаю живность') DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `flat_internet` tinyint(1) DEFAULT NULL,
  `flat_microwave` tinyint(1) DEFAULT NULL,
  `flat_room_num` int(11) DEFAULT NULL,
  `flat_total_pay` int(11) DEFAULT NULL,
  `flat_square` int(11) DEFAULT NULL,
  `flat_conditioner` tinyint(1) DEFAULT NULL,
  `flat_coffee` tinyint(1) DEFAULT NULL,
  `user_age_range` enum('18-25','18-30','не важно') DEFAULT NULL,
  `user_university` varchar(200) DEFAULT NULL,
  `user_car` tinyint(1) DEFAULT NULL,
  `user_success` enum('не важно','хорошист','отличник') DEFAULT NULL,
  `rent_pay` int(11) DEFAULT NULL,
  `flat_parking` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `post` */

/*Table structure for table `priority` */

DROP TABLE IF EXISTS `priority`;

CREATE TABLE `priority` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `display_name_full` varchar(150) NOT NULL,
  `display_name_short` varchar(75) NOT NULL,
  `display_order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

/*Data for the table `priority` */

insert  into `priority`(`id`,`display_name_full`,`display_name_short`,`display_order`) values 
(1,'С кем вы хотите снимать квартиру?','С кем вы хотите снимать квартиру?',1),
(2,'Важен ли возраст вашего соседа по комнате?','Важен ли возраст?',2),
(3,'Социальная активность румейта?','Социальная активность',3),
(4,'Вредные привычки?','Вредные привычки?',4),
(5,'Домашние животные?','Домашние животные?',5),
(6,'Наличие машины?','Наличие машины?',6),
(7,'Нужен сосед с определнного ВУЗа?','Нужен сосед с определнного ВУЗа?',7),
(8,'Желаемый уровень успеваемости соседа?','Успеваемость?',8),
(9,'Важна ли чистота и порядок?','Чистота и порядок?',9);

/*Table structure for table `priority_option` */

DROP TABLE IF EXISTS `priority_option`;

CREATE TABLE `priority_option` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `priority_id` int(11) NOT NULL,
  `default` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `character_fk` (`priority_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;

/*Data for the table `priority_option` */

insert  into `priority_option`(`id`,`name`,`priority_id`,`default`) values 
(1,'Не важно с кем',1,1),
(2,'Только с девушками',1,0),
(3,'Только с парнями',1,0),
(4,'Не важен',2,1),
(5,'18-25',2,0),
(6,'18-30',2,0),
(7,'Не важна',3,1),
(8,'Интроверт',3,0),
(9,'Экстраверт',3,0),
(10,'Не важно',4,1),
(11,'Курит',4,0),
(12,'Курит и пьет',4,0),
(13,'Не курит и не пьет',4,0),
(14,'Не важно',5,1),
(15,'Небольшие только',5,0),
(16,'Обожаю живность',5,0),
(17,'Не важно',6,1),
(18,'Есть',6,0),
(19,'Нет',6,0),
(20,'Не важно',7,1),
(21,'РИНХ',7,0),
(22,'ЮФУ',7,0),
(23,'ДГТУ',7,0),
(24,'Не важна',8,1),
(25,'Отличник',8,0),
(26,'Хорошист',8,0),
(27,'Не важно',9,1),
(28,'Важно',9,0),
(29,'Люблю когда грязно',9,0);

/*Table structure for table `roommate_request` */

DROP TABLE IF EXISTS `roommate_request`;

CREATE TABLE `roommate_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `status` enum('pending','accepted','declined') NOT NULL,
  `is_viewed` tinyint(1) NOT NULL DEFAULT '0',
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Data for the table `roommate_request` */

insert  into `roommate_request`(`id`,`from_user_id`,`to_user_id`,`status`,`is_viewed`,`date_created`,`date_updated`) values 
(1,19,1,'pending',0,'2017-12-14 16:02:35','2017-12-14 16:02:40'),
(2,2,19,'pending',0,'2017-12-14 16:02:56','2017-12-14 16:02:59');

/*Table structure for table `session` */

DROP TABLE IF EXISTS `session`;

CREATE TABLE `session` (
  `token` varchar(32) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `session` */

insert  into `session`(`token`,`user_id`) values 
('2EmvTZzGX2ZNAj0aisKvf9jttCtqjWxG',19),
('3lBbNjLMS1af0rCRZQmBlmbjkJ6frADX',19),
('43A76k6nBxhqU6lElpdZWqbgBDevuEJq',19),
('4L1D9VQ0G5PqpFz1zFzEUic1HI8fcsQc',19),
('5ks0a5KbUyV0BRl25OBzHmfYduRvyY1n',19),
('5nLwp9QXuUG0hC1EYxxp7ZcNXpbM0lIb',19),
('6iKXqk26QVpc9nAgIcyqckOyfca1n4b5',19),
('8e003ONulyQqPQMgMYu5VegZnUA798uJ',19),
('8oLNys549HoKjOxO4ce8Bi0cvllAKAD9',19),
('akO46a2QBKwAdKRWGNmjFdxtKb3DkOhf',19),
('bW0eqGs4tLxpqyJG6O1VQZibSOo9ZqFJ',19),
('cywZRjXknHQw7uxmBDb00s7zwAz9g9nm',19),
('dh1h94X8I6yTWEWSCK2pY7wdLIxiryK8',19),
('dhlANT8xnRAvfLXi62m4NGA2J2N8tWli',19),
('euVclGh1pwJXkbhMTz6ccFAVX74HYVRQ',19),
('FmtjnUcWW1361e02PEpmtntfIF76vw9a',19),
('HoGZqUlufsBE4IOBnCKEpa4ZcFQD8jfg',19),
('iTru9HBhlwevsN7no9NBl1pLj008dD1a',19),
('jZIdojGh8dqvRefa6G36Teg9Jq3xm6Xu',19),
('LnR2hWzfQ0rmnJTRBiPfsIc0bk71LakS',19),
('OKLLwAb79V5d3fkxe0o56DgPQ5lDjSaz',19),
('ozGDPOoTjG9JhUTcULoxzmrEbj00QPZ4',19),
('pQ3X9jWAXg8UQd8XWAhNCm8ERfK3qctm',19),
('pVAtrDtM2V3eTi1KCLpfdHXrPy0JPzpI',19),
('pVbaLQkwsicWBSGmWjOZIE1STjre9O7Y',19),
('pWoihGR5Y5wyimL4a4u9pRUmJSyqmUSN',19),
('QkznFmxKKVR50JIS9CtvN4DwDoSKCcDW',19),
('R06kX7X986AHIs6FrzvjZ8heLhTAO2Ez',19),
('rNKmBVctZlLXld96SFtHSamFcHmwBq4S',19),
('SF9OKf2Mb0bcgvBxbtegFMFj0DM5fEyy',19),
('tD1mCDS97mRnJao3yhHrOzbrCqERx0Gr',19),
('tJP22EwlCLmN4O1jp1B8pYsl0bTCXrFq',19),
('uZB70MpxUD5UZspWpLSU2hZW3JPM3wC1',19),
('wH0VtCwNkOLDvIIHCaUEQOkr0CkxmanZ',19),
('wm21zSpy0424yxSfphXhoh5wWKyyhB4S',19),
('WyQ69ZUA2YUiepwC62Y8qPfK9TnNxGJF',19),
('X1ZAzLDzjzBMHrKA0J2jwZV1Wv6dRqIa',19),
('xDHMvO9t2TlAxfeDftJ4KiEeit3IsW6N',19),
('xtwuViicAKQd3ON2OLeePToU76n5S0Bn',19),
('YB7TMoNldbb2eg7gIzXJltUk7Tovc7RC',19),
('YqP1xEOHMvj6N2Wzuzd2phQsv5TKHqm6',19),
('yrs9dCfjnZns2A4ya3KUXuhH6x1FVTFz',19),
('yYD2AStSxEgBoIYTCUrNtqi4DEQUNrC6',19),
('Z9ucqeM26mKGaQoiTozWVHo9VOb3mnTM',19),
('zT8baD1rIZMBuyVTTlJyDvFK78NZbaMi',19),
('zvqxxkzs0CMyJts6aFTRiZH9pJmSvcmR',19);

/*Table structure for table `university` */

DROP TABLE IF EXISTS `university`;

CREATE TABLE `university` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name_full` varchar(300) NOT NULL,
  `name_short` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/*Data for the table `university` */

insert  into `university`(`id`,`name_full`,`name_short`) values 
(1,'ЮФУ (бывш. РГУ)',NULL);

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `birth_date` datetime NOT NULL,
  `age` int(11) NOT NULL,
  `about` text,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `avatar` varchar(200) NOT NULL COMMENT '200x200',
  `sex` enum('мужской','женский','не важно') NOT NULL,
  `wish_pay` int(11) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `university` varchar(200) NOT NULL,
  `faculty` varchar(200) NOT NULL,
  `speciality` varchar(150) NOT NULL,
  `study_year` varchar(50) DEFAULT NULL,
  `date_register` datetime NOT NULL,
  `register_from_vk` tinyint(1) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `login` varchar(100) DEFAULT NULL,
  `vk_id` int(11) NOT NULL,
  `flat_id` int(11) DEFAULT NULL,
  `char_age` enum('18-25','18-30','не важно') DEFAULT NULL,
  `char_activity` enum('не важно','интроверт','экстраверт') DEFAULT NULL,
  `char_habbits` enum('не важно','курит','пьет','курит и пьет','не курит и не пьет') DEFAULT NULL,
  `char_pets` enum('не важно','только небольшие','обожаю животных') DEFAULT NULL,
  `char_car` enum('не важно','есть','нет') DEFAULT NULL,
  `char_university` enum('не важно') DEFAULT NULL,
  `complains_available` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

/*Data for the table `user` */

insert  into `user`(`id`,`first_name`,`last_name`,`birth_date`,`age`,`about`,`phone`,`email`,`avatar`,`sex`,`wish_pay`,`city`,`university`,`faculty`,`speciality`,`study_year`,`date_register`,`register_from_vk`,`password`,`login`,`vk_id`,`flat_id`,`char_age`,`char_activity`,`char_habbits`,`char_pets`,`char_car`,`char_university`,`complains_available`) values 
(1,'Джон','Сноу','1995-12-10 00:00:00',22,'Джон Сноу (урождённый Эйгон Таргариен) — сын Рейгара Таргариена и Лианны Старк, наследник Железного трона. Считается внебрачным сыном лорда Винтерфелла Эддарда Старка.','+7(999)-999-99-99','johnsnow@gameofthrones.com','/images/john_snow.jpg','мужской',0,'Винтерфелл','Университет Винтерфела для бастардов','Факультет прикладных наук','на север!','80','2017-11-12 06:00:57',0,'john','john',0,21,'18-25',NULL,NULL,NULL,NULL,NULL,1),
(2,'Дейнерис','Таргариен','1995-06-15 00:00:00',22,'Дейнерис Таргариен — дочь «Безумного короля» Эйриса II и королевы Рейлы, свергнутых с железного трона во время восстания Роберта. Младшая сестра Рейгара и Визериса Таргариенов.','+7(333)-333-33-33','daenerys@gameofthrones.com','/images/daenerys.png','женский',0,'Пентос','Не училась в университетах','Факультет захвата Железного трона','не знаю','80','2017-11-12 06:20:04',0,'daenerys','daenerys',0,NULL,'18-25',NULL,NULL,NULL,NULL,NULL,1),
(19,'Кирилл','Владыкин','1989-06-28 00:00:00',28,'Одинокий мужчина ну в пооолном расцвете сил','+7(988)-569-02-95','kirillmybox@rambler.ru','/images/uploads/user_19/1512900487803.jpg','мужской',0,'Ростов-на-Дону','ЮФУ (бывш. РГУ)','Институт математики, механики и компьютерных наук (бывш. Механико-математический)','ИТ','1','2017-12-02 20:30:47',1,NULL,NULL,16718732,34,NULL,NULL,NULL,NULL,NULL,NULL,0);

/*Table structure for table `user_complains` */

DROP TABLE IF EXISTS `user_complains`;

CREATE TABLE `user_complains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `complain_id` int(11) NOT NULL,
  `comment` varchar(500) DEFAULT NULL,
  `date_created` datetime NOT NULL,
  `is_processed` tinyint(1) NOT NULL DEFAULT '0',
  `date_processed` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

/*Data for the table `user_complains` */

/*Table structure for table `user_priority_option` */

DROP TABLE IF EXISTS `user_priority_option`;

CREATE TABLE `user_priority_option` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `priority_option_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_fk` (`user_id`),
  KEY `character_value_fk` (`priority_option_id`)
) ENGINE=InnoDB AUTO_INCREMENT=589 DEFAULT CHARSET=utf8;

/*Data for the table `user_priority_option` */

insert  into `user_priority_option`(`id`,`user_id`,`priority_option_id`) values 
(499,2,1),
(500,2,4),
(501,2,7),
(502,2,10),
(503,2,14),
(504,2,17),
(505,2,20),
(506,2,24),
(507,2,27),
(571,1,1),
(572,1,4),
(573,1,8),
(574,1,13),
(575,1,14),
(576,1,18),
(577,1,21),
(578,1,24),
(579,1,27),
(580,19,2),
(581,19,5),
(582,19,8),
(583,19,11),
(584,19,15),
(585,19,19),
(586,19,21),
(587,19,24),
(588,19,28);

/*Table structure for table `utility` */

DROP TABLE IF EXISTS `utility`;

CREATE TABLE `utility` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `display_name` varchar(50) NOT NULL,
  `display_order` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

/*Data for the table `utility` */

insert  into `utility`(`id`,`display_name`,`display_order`) values 
(1,'Кондиционер',1),
(2,'Микроволновка',2),
(3,'Кофемашина',3),
(4,'Парковка',4),
(5,'Wi-fi',5);

/*Table structure for table `v_priority` */

DROP TABLE IF EXISTS `v_priority`;

/*!50001 DROP VIEW IF EXISTS `v_priority` */;
/*!50001 DROP TABLE IF EXISTS `v_priority` */;

/*!50001 CREATE TABLE  `v_priority`(
 `option_id` int(11) ,
 `option_name` varchar(100) ,
 `priority_id` int(11) ,
 `priority_name_full` varchar(150) ,
 `priority_name_short` varchar(75) ,
 `order` int(11) 
)*/;

/*Table structure for table `v_user_priority` */

DROP TABLE IF EXISTS `v_user_priority`;

/*!50001 DROP VIEW IF EXISTS `v_user_priority` */;
/*!50001 DROP TABLE IF EXISTS `v_user_priority` */;

/*!50001 CREATE TABLE  `v_user_priority`(
 `priority_id` int(11) ,
 `priority_name_full` varchar(150) ,
 `option_id` int(11) ,
 `option_name` varchar(100) ,
 `user_id` int(11) 
)*/;

/*View structure for view v_priority */

/*!50001 DROP TABLE IF EXISTS `v_priority` */;
/*!50001 DROP VIEW IF EXISTS `v_priority` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_priority` AS (select `priority_option`.`id` AS `option_id`,`priority_option`.`name` AS `option_name`,`priority`.`id` AS `priority_id`,`priority`.`display_name_full` AS `priority_name_full`,`priority`.`display_name_short` AS `priority_name_short`,`priority`.`display_order` AS `order` from (`priority` join `priority_option` on((`priority_option`.`priority_id` = `priority`.`id`))) order by `priority`.`display_order`) */;

/*View structure for view v_user_priority */

/*!50001 DROP TABLE IF EXISTS `v_user_priority` */;
/*!50001 DROP VIEW IF EXISTS `v_user_priority` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_user_priority` AS (select `priority`.`id` AS `priority_id`,`priority`.`display_name_full` AS `priority_name_full`,`priority_option`.`id` AS `option_id`,`priority_option`.`name` AS `option_name`,`user_priority_option`.`user_id` AS `user_id` from ((`user_priority_option` join `priority_option` on((`user_priority_option`.`priority_option_id` = `priority_option`.`id`))) join `priority` on((`priority_option`.`priority_id` = `priority`.`id`)))) */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
