using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;


namespace Hotains.Utility
{
    public class APIHelper
    {
        //授權標頭
        public string autHead { get; set; }
        //授權參數值
        public string authString { get; set; }

        /// <summary>
        /// 呼叫API使用FormData 格式
        /// </summary>
        /// <param name="keyValuePairs"></param>
        /// <param name="uploadFile"></param>
        public string PostAsyncWithFormData(List<KeyValuePair<string, string>> keyValuePairs, byte[] uploadFile)
        {
            string postResult = "";
            using (var client = new HttpClient())
            {
                using (var multipartFormDataContent = new MultipartFormDataContent())
                {
                    foreach (var keyValuePair in keyValuePairs)
                    {
                        multipartFormDataContent.Add(new StringContent(keyValuePair.Value),
                            String.Format("\"{0}\"", keyValuePair.Key));
                    }
                    if (uploadFile != null && uploadFile.Length > 0)
                        multipartFormDataContent.Add(new ByteArrayContent(uploadFile),
                            "\"PostedFile\"",
                            "\"MergePDF.zip\"");

                    var requestUri = "http://192.168.128.90:76/HT_FileManage/WebAPIArchive/ImageArchive";
                    postResult = client.PostAsync(requestUri, multipartFormDataContent).Result.Content.ReadAsStringAsync().Result;
                }
            }
            return postResult;
        }

        /// <summary>
        /// 使用 Get 取得查詢資料
        /// </summary>
        /// <param name="getUrl">目標網址</param>
        /// <param name="autHead">Authorization 標頭</param>
        /// <param name="authString">Authorization 參數值</param>
        /// <returns>回傳取得的字串</returns>
        public async Task<string> GetStringData(string getUrl)
        {
            HttpClient client = new HttpClient();
            autHead = "Basic";
            authString = Convert.ToBase64String(Encoding.UTF8.GetBytes("qa:qa"));
            if (!string.IsNullOrWhiteSpace(autHead) && !string.IsNullOrWhiteSpace(authString))
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(autHead, authString);
            client.DefaultRequestHeaders.Add("Accept-Language", "zh-TW");
            var rep = await client.GetStringAsync(getUrl);
            return rep;
        }


        public async Task<string> PostData(string url, object obj)
        {
            //autHead = "Basic";
            //authString = Convert.ToBase64String(Encoding.UTF8.GetBytes("qa:qa"));
            //url = "https://ibm6-hot-app01.eisgroup.com/agent/v1/customers/510008/business-additional-names";
            //obj = new { nameDba = "快食經營企業test" };
            var json = JsonConvert.SerializeObject(obj);
            var data = new StringContent(json, Encoding.UTF8, "application/json");
            string result = "";
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(autHead, authString);

                var response = await client.PostAsync(url, data);

                result = response.Content.ReadAsStringAsync().Result;
            }
            return result;
        }


        //public async Task<string> PutData(string putUrl, object objData)
        //{
        //    //autHead = "Basic";
        //    //authString = Convert.ToBase64String(Encoding.UTF8.GetBytes("qa:qa"));
        //    string result = "";
        //    using (HttpClient client = new HttpClient())
        //    {
        //        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(autHead, authString);
        //        var response = await client.PutAsJsonAsync(putUrl, objData);
        //        if (response.IsSuccessStatusCode)
        //            // Deserialize the updated product from the response body.
        //            result = response.Content.ReadAsStringAsync().Result;
        //    }
        //    return result;
        //}

        public async Task<HttpStatusCode> DeleteData(string deleteUrl)
        {
            //autHead = "Basic";
            //authString = Convert.ToBase64String(Encoding.UTF8.GetBytes("qa:qa"));
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(autHead, authString);
            HttpResponseMessage response = await client.DeleteAsync(deleteUrl);
            return response.StatusCode;
        }

        public string GetQueryString(object obj, bool allowNullValue = false)
        {
            var properties = from p in obj.GetType().GetProperties()
                             where allowNullValue || (p.GetValue(obj, null) != null)
                             select p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(obj, null).ToString());

            return "?" + String.Join("&", properties.ToArray());
        }
    }
}