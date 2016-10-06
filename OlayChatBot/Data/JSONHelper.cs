using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace OlayChatBot.Data
{

    public static class JSONHelper
    {
        private static Products productList;
        public static Products ReadJsonData()
        {
            try
            {
                if (productList == null)
                {
                    string path = HttpContext.Current.Request.MapPath("").Replace("\\api", "\\data\\OlayProduct.json");
                    string json = File.ReadAllText(path);


                    Products data = new Products();

                    JsonConvert.PopulateObject(json, data);
                    if (data != null)
                    {
                        productList = data;
                        // holidayData = (from d in holidayData orderby d.Date select d).ToList();                       
                    }
                }
                return productList;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}