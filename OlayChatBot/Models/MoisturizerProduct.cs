using Microsoft.Bot.Builder.FormFlow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OlayChatBot.Models
{

    public enum MoisturiserType { DayMoisturiser = 1, NightMoisturiser, SunProtectionFromUV };
    public enum spfValue { Below15Or15 = 1, Above15 };
    [Serializable]
    public class MoisturiserProduct
    {
        [Prompt("Which Moisturiser type you want? {||}")]
        [Template(TemplateUsage.NotUnderstood, "What does \"{0}\" mean?")]
        [Describe("Type of Moisturiser")]
        public MoisturiserType? moisType;

        [Prompt("What spf value do you want? {||}")]
        [Template(TemplateUsage.NotUnderstood, "What does \"{0}\" mean?")]
        public spfValue? spfval;
    }
}