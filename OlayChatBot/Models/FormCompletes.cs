using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Connector;
using OlayChatBot.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace OlayChatBot.Models
{
    public class FormCompletes
    {

        public async static Task CreateDayMoisturiserCard(IDialogContext context)
        {
            Products data = JSONHelper.ReadJsonData();

            List<Product> searchResult = data.products.FindAll(x => x.Type == "Day Moisturiser");

            var message = context.MakeMessage();
            message.Attachments = new List<Attachment>();

            foreach (Product p in searchResult)
            {
                List<CardImage> cardImages = new List<CardImage>();
                cardImages.Add(new CardImage(url: p.ImagePath.ToString()));
                List<CardAction> cardButtons = new List<CardAction>();
                CardAction plButton = new CardAction()
                {
                    Value = p.URL,
                    Type = ActionTypes.OpenUrl,
                    Title = "Buy It"
                };
                CardAction p2Button = new CardAction()
                {
                    Value = p.ProductId,
                    Type = ActionTypes.ImBack,
                    Title = "Locate Store"
                };
                cardButtons.Add(plButton);
                cardButtons.Add(p2Button);

                HeroCard plCard = new HeroCard()
                {
                    Title = p.Name,
                    Subtitle = p.Type,
                    Images = cardImages,
                    Buttons = cardButtons
                };
                Attachment plAttachment = plCard.ToAttachment();
                message.Attachments.Add(plAttachment);

            }
            message.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            await context.PostAsync(message);
        }

        public async static Task CreateNightMoisturiserCard(IDialogContext context)
        {
            Products data = JSONHelper.ReadJsonData();

            List<Product> searchResult = data.products.FindAll(x => x.Type == "Night Moisturiser");

            var message = context.MakeMessage();
            message.Attachments = new List<Attachment>();

            foreach (Product p in searchResult)
            {
                List<CardImage> cardImages = new List<CardImage>();
                cardImages.Add(new CardImage(url: p.ImagePath.ToString()));
                List<CardAction> cardButtons = new List<CardAction>();
                CardAction plButton = new CardAction()
                {
                    Value = p.URL,
                    Type = "openUrl",
                    Title = "Buy It"
                };
                CardAction p2Button = new CardAction()
                {
                    Value = p.ProductId,
                    Type = ActionTypes.ImBack,
                    Title = "Locate Store"
                };
                cardButtons.Add(plButton);
                cardButtons.Add(p2Button);

                HeroCard plCard = new HeroCard()
                {
                    Title = p.Name,
                    Subtitle = p.Type,
                    Images = cardImages,
                    Buttons = cardButtons
                };
                Attachment plAttachment = plCard.ToAttachment();
                message.Attachments.Add(plAttachment);

            }
            message.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            await context.PostAsync(message);
        }

        public async static Task CreateSpfAbove15Card(IDialogContext context)
        {
            Products data = JSONHelper.ReadJsonData();

            List<Product> searchResult = data.products.FindAll(x => x.SPFValue > 15);

            var message = context.MakeMessage();
            message.Attachments = new List<Attachment>();

            foreach (Product p in searchResult)
            {
                List<CardImage> cardImages = new List<CardImage>();
                cardImages.Add(new CardImage(url: p.ImagePath.ToString()));
                List<CardAction> cardButtons = new List<CardAction>();
                CardAction plButton = new CardAction()
                {
                    Value = p.URL,
                    Type = "openUrl",
                    Title = "Buy It"
                };
                CardAction p2Button = new CardAction()
                {
                    Value = p.ProductId,
                    Type = ActionTypes.ImBack,
                    Title = "Locate Store"
                };
                cardButtons.Add(plButton);
                cardButtons.Add(p2Button);

                HeroCard plCard = new HeroCard()
                {
                    Title = p.Name,
                    Subtitle = p.Type + "\n SPF Value : " + p.SPFValue,
                    Images = cardImages,
                    Buttons = cardButtons
                };
                Attachment plAttachment = plCard.ToAttachment();
                message.Attachments.Add(plAttachment);

            }
            message.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            await context.PostAsync(message);
        }

        public async static Task CreateSpfBelow15Card(IDialogContext context)
        {
            Products data = JSONHelper.ReadJsonData();

            List<Product> searchResult = data.products.FindAll(x => x.SPFValue <= 15);

            var message = context.MakeMessage();
            message.Attachments = new List<Attachment>();

            foreach (Product p in searchResult)
            {
                List<CardImage> cardImages = new List<CardImage>();
                cardImages.Add(new CardImage(url: p.ImagePath.ToString()));
                List<CardAction> cardButtons = new List<CardAction>();
                CardAction plButton = new CardAction()
                {
                    Value = p.URL,
                    Type = "openUrl",
                    Title = "Buy It"
                };
                CardAction p2Button = new CardAction()
                {
                    Value = p.ProductId,
                    Type = ActionTypes.ImBack,
                    Title = "Locate Store"
                };
                cardButtons.Add(plButton);
                cardButtons.Add(p2Button);

                HeroCard plCard = new HeroCard()
                {
                    Title = p.Name,
                    Subtitle = p.Type + "\n SPF Value : " + p.SPFValue,
                    Images = cardImages,
                    Buttons = cardButtons
                };
                Attachment plAttachment = plCard.ToAttachment();
                message.Attachments.Add(plAttachment);

            }
            message.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            await context.PostAsync(message);
        }

    }
}