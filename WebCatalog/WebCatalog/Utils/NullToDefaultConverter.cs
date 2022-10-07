using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WebCatalog.Utils
{
    public class NullToDefaultConverter<T> : JsonConverter where T : struct
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(T);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var token = JToken.Load(reader);
            if (token == null || token.Type == JTokenType.Null)
                return default(T);
            return token.ToObject(objectType); // Deserialize using default serializer
        }

        // Return false instead if you don't want default values to be written as null
        public override bool CanWrite { get { return true; } }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (EqualityComparer<T>.Default.Equals((T)value, default(T)))
                writer.WriteNull();
            else
                writer.WriteValue(value);
        }
    }
}
