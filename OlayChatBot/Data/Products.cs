using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OlayChatBot.Data
{
        public class Products
        {
            public List<Product> products { get; set; }
        }

        public class Product
        {
            public string ProductId { get; set; }
            public string Name { get; set; }
            public string Type { get; set; }
            public int SPFValue { get; set; }
            public string ImagePath { get; set; }
            public string URL { get; set; }
            public string Location { get; set; }
            public string Pin { get; set; }
            public int Quantity { get; set; }
        }
    
}