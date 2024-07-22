﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopRe.Common.DTOs
{
    public class SellerInfo
    {
        public int ID_NK { get; set; }
        public int? ID_SK { get; set; }
        public string? Name { get; set; }
        public bool? IsOfficial { get; set; }
        public string? StoreLevel { get; set; }
        public double? AvgRatingPoint { get; set; }
        public int? TotalFollower { get; set; }
        public int? ReviewCount { get; set; }
        public string? ImageUrl { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? ApplicationUserId { get; set; }
    }
}