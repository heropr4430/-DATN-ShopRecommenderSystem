﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShopRe.Common.RequestFeatures
{
    public class ChangePasswordParameters
    {
        public string PasswordOld {  get; set; }
        public string PasswordNewConfirm { get; set; }
        public string PasswordNew { get; set; }
    }
}
