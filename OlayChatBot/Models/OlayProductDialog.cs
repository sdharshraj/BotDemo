using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.FormFlow;
using Microsoft.Bot.Builder.Luis;
using Microsoft.Bot.Builder.Luis.Models;
using Microsoft.Bot.Connector;
using OlayChatBot.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace OlayChatBot.Models
{
    [LuisModel(Keys.LuisId, Keys.LuisSecret)]
    [Serializable]
    public class OlayProductDialog : LuisDialog<MoisturiserProduct>
    {
        private readonly BuildFormDelegate<MoisturiserProduct> MakeProductForm;

        internal OlayProductDialog(BuildFormDelegate<MoisturiserProduct> makeProductForm)
        {
            this.MakeProductForm = makeProductForm;
        }

        #region LuisIntents
        [LuisIntent("")]
        [LuisIntent("None")]
        public async Task None(IDialogContext context, IAwaitable<IMessageActivity> item, LuisResult result)
        {
            await context.PostAsync("Sorry I could not understand you.");
            context.Wait(MessageReceived);
        }

        [LuisIntent("Greet")]
        public async Task Greet(IDialogContext context, LuisResult result)
        {
            await context.PostAsync(MessagesResource.Welcome);
            context.Wait(MessageReceived);
        }

        [LuisIntent("Product")]
        public async Task Product(IDialogContext context, LuisResult result)
        {
            var productForm = new FormDialog<MoisturiserProduct>(new MoisturiserProduct(), this.MakeProductForm, FormOptions.PromptInStart);
          
            context.Call<MoisturiserProduct>(productForm, ProductFormComplete);
        }
        [LuisIntent("LocateStore")]
        public async Task LocateStore(IDialogContext context, LuisResult result)
        {
            if (result.Query.StartsWith("pid"))
            {
                var message = result.Query;
                Products data = JSONHelper.ReadJsonData();

                List<Product> searchResult = data.products.FindAll(x => x.ProductId == message);

                if (searchResult != null && searchResult.Count > 0)
                {
                    string str = $"##### Stores Near to your Location" + Environment.NewLine + Environment.NewLine;
                    int count = 1;
                    foreach (var item in searchResult)
                    {
                        str += $"{count}. {item.Location} " + Environment.NewLine + Environment.NewLine + "No. of Product available : " + item.Quantity + Environment.NewLine;
                        count++;
                    }
                    await context.PostAsync(str);
                    context.Wait(MessageReceived);
                }
                else
                {
                    await context.PostAsync($"There is No store near your location for this particular product.");
                    context.Wait(MessageReceived);
                }
            }
            else
            PromptDialog.Text(context, LocateStoreComplete, "Please enter the Pin Code to locate nearby stores.");
        }
        int counter = 0;
        private async Task LocateStoreComplete(IDialogContext context, IAwaitable<string> result)
        {
            var val = await result;
            string pin = ValidatePin(val);
           
            if (pin != "")
            {
                Products data = JSONHelper.ReadJsonData();

                List<Product> searchResult = data.products.FindAll(x => x.Pin == pin);


                if (searchResult != null && searchResult.Count > 0)
                {
                    string str = $"##### Stores Near to your Location Containing Olay Product " + Environment.NewLine + Environment.NewLine;
                    int count = 1;
                    foreach (var item in searchResult)
                    {
                        str += $"{count}. {item.Location} " + Environment.NewLine + Environment.NewLine;
                        count++;
                    }
                    await context.PostAsync(str);
                    counter = 0;
                    context.Wait(MessageReceived);
                }
                else
                {
                    await context.PostAsync($"There is No store near your location.");
                    context.Wait(MessageReceived);
                    counter = 0;
                }
            }
            else
            {
                if (counter < 2)
                {
                    PromptDialog.Text(context, LocateStoreComplete, "Please enter correct Pin Code to locate nearby stores.");
                    counter++;
                }
                else
                {
                    await context.PostAsync("I think we are in wrong place. Start again.");
                    context.Wait(MessageReceived);
                }
            }
        }

        [LuisIntent("End")]
        public async Task End(IDialogContext context, LuisResult result)
        {
            await context.PostAsync(MessagesResource.EndMessage);
            context.Wait(MessageReceived);
        }
        
        #endregion
        
        private async Task ProductFormComplete(IDialogContext context, IAwaitable<MoisturiserProduct> result)
        {
            var var = await result;
            
            if(var.moisType == MoisturiserType.DayMoisturiser)
            {
                await FormCompletes.CreateDayMoisturiserCard(context);
            }
            else if(var.moisType == MoisturiserType.NightMoisturiser)
            {
                await FormCompletes.CreateNightMoisturiserCard(context);
            }
            else if(var.spfval == spfValue.Above15)
            {
                await FormCompletes.CreateSpfAbove15Card(context);
            }
            else if(var.spfval == spfValue.Below15Or15)
            {
                await FormCompletes.CreateSpfBelow15Card(context);
            }
            else
            {
                await context.PostAsync("Did not get you. Try again.");
                context.Wait(MessageReceived);
                return;
            }
            context.Wait(MessageReceived);
        }
        internal static bool TryToGetValue(string text, string reg, out string value)
        {
            value = string.Empty;
            Regex r = new Regex(reg, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            Match m = r.Match(text);
            if (m.Success)
            {
                value = m.Value;
                return true;
            }
            return false;
        }

        internal static string ValidatePin(string userPin)
        {
            string pin;
            Regex pinReg = new Regex(@"\s(\d{6})");
            if (Util.TryToGetValue(userPin, @"(\d{6})", out pin))
                return pin;
            return string.Empty;
        }
        private string GenerateRandom(string seed)
        {
            Random rand = new Random(seed.GetHashCode() + DateTime.Now.GetHashCode());
            return rand.Next(1000, 9999).ToString();
        }
        
        private string TryToGetEntity(LuisResult result, string key)
        {
            EntityRecommendation entity;
            result.TryFindEntity(key, out entity);
            if (entity != null)
                return Convert.ToString(entity.Entity);
            return string.Empty;
        }

        private List<string> TryToGetMultipleEntity(LuisResult result, string key)
        {
            EntityRecommendation entity;
            result.TryFindEntity(key, out entity);
            if (entity != null)
                return null;
            return null;
        }
        
        private string GetFormatedDate(Chronic.Span span)
        {
            return string.Format("{0:dddd, MMMM d, yyyy}", span.ToTime());
        }

        public static IForm<MoisturiserProduct> BuildForm()
        {
            var builder = new FormBuilder<MoisturiserProduct>();
            ActiveDelegate<MoisturiserProduct> isSunProtection = (product) => product.moisType == MoisturiserType.SunProtectionFromUV;

            return builder
                .Field(nameof(MoisturiserProduct.moisType))
                .Field(nameof(MoisturiserProduct.spfval), isSunProtection)
                .Build()
                ;
        }
    }
}