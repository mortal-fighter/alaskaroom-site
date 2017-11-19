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

/*Table structure for table `flat` */

DROP TABLE IF EXISTS `flat`;

CREATE TABLE `flat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_num` int(11) NOT NULL,
  `flat_total_pay` int(11) DEFAULT NULL,
  `square` varchar(50) NOT NULL,
  `traffic` varchar(300) DEFAULT NULL,
  `util_conditioner` tinyint(1) DEFAULT NULL,
  `util_coffee` tinyint(1) DEFAULT NULL,
  `util_microwave` tinyint(1) DEFAULT NULL,
  `util_internet` tinyint(1) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `address` varchar(200) NOT NULL,
  `util_parking` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

/*Data for the table `flat` */

/*Table structure for table `photo` */

DROP TABLE IF EXISTS `photo`;

CREATE TABLE `photo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `src_small` varchar(200) DEFAULT NULL,
  `src_orig` varchar(200) NOT NULL,
  `width_orig` int(11) NOT NULL,
  `height_orig` int(11) NOT NULL,
  `width_small` int(11) DEFAULT NULL,
  `height_small` int(11) DEFAULT NULL,
  `flat_id` int(11) NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Data for the table `photo` */

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
  `user_university` enum('ЮФУ','РИНХ','не важно') DEFAULT NULL,
  `user_car` tinyint(1) DEFAULT NULL,
  `user_success` enum('не важно','хорошист','отличник') DEFAULT NULL,
  `rent_pay` int(11) DEFAULT NULL,
  `flat_id` int(11) DEFAULT NULL,
  `flat_parking` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

/*Data for the table `post` */

/*Table structure for table `user` */

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `sex` enum('мужской','женский','не важно') NOT NULL,
  `age` int(11) NOT NULL,
  `city` varchar(100) NOT NULL,
  `university` enum('не важно','ЮФУ','РИНХ') NOT NULL,
  `faculty` varchar(200) NOT NULL,
  `about` text,
  `phone` varchar(50) NOT NULL,
  `avatar` varchar(200) DEFAULT NULL,
  `social_activity` enum('интроверт','экстраверт','не важно') NOT NULL,
  `bad_habbits` enum('курение','алкоголь','алкоголь и курение','нет','не важно') NOT NULL,
  `pets` enum('обожаю живность','не важно','небольшие только') DEFAULT NULL,
  `date_register` datetime NOT NULL,
  `register_from_vk` tinyint(1) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `login` varchar(100) DEFAULT NULL,
  `age_range` enum('18-25','18-30','не важно') DEFAULT NULL,
  `car` tinyint(1) DEFAULT NULL,
  `success` enum('не важно','хорошист','отличник') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

/*Data for the table `user` */

insert  into `user`(`id`,`first_name`,`last_name`,`user_email`,`sex`,`age`,`city`,`university`,`faculty`,`about`,`phone`,`avatar`,`social_activity`,`bad_habbits`,`pets`,`date_register`,`register_from_vk`,`password`,`login`,`age_range`,`car`,`success`) values 
(1,'Джон','Сноу','johnsnow@gameofthrones.com','мужской',22,'Винтерфелл','','Прикладные науки','Джон Сноу (урождённый Эйгон Таргариен) — сын Рейгара Таргариена и Лианны Старк, наследник Железного трона. Считается внебрачным сыном лорда Винтерфелла Эддарда Старка.','+7(999)-999-99-99','john_snow.jpg','интроверт','нет','не важно','2017-11-12 06:00:57',0,'john','john','18-25',NULL,NULL),
(2,'Дейнерис','Таргариен','daenerys@gameofthrones.com','женский',22,'Пентос','','Захвата железного трона','Дейнерис Таргариен — дочь «Безумного короля» Эйриса II и королевы Рейлы, свергнутых с железного трона во время восстания Роберта. Младшая сестра Рейгара и Визериса Таргариенов.','+7(333)-333-33-33','daenerys.jpg','экстраверт','алкоголь','обожаю живность','2017-11-12 06:20:04',0,'daenerys','daenerys','18-25',NULL,NULL);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
