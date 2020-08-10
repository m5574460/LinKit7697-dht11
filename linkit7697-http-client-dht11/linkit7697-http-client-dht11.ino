// 引入linkit 7697的wifi函式庫
#include <LWiFi.h>
#include "DHT.h"

// dht11 使用腳位2
#define DHTPIN 2
// 使用DHT11感測器
#define DHTTYPE DHT11

// 建構DHT類別物件
DHT dht(DHTPIN, DHTTYPE);

// wifi SSID (例如:ES302)
char ssid[] = "ES715_TP_2.4G";

// wifi 密碼
char pass[] = "AI715nxt4391rcx";

// nodejs伺服器ip
String host = "140.125.32.148";

// nodejs伺服器port
uint16_t port = 4000;

// POST到的url
String postUrl = "/temp";

// 溫溼度 
float temp, humid;

// 流水號
unsigned long id = 0;

// 使用POST輸入JSON格式的字串
String postJson = "";

// 與WiFi裝置連項狀態
int status = WL_IDLE_STATUS;

// 初始化網路客戶端類別物件
WiFiClient client;

void setup() {
    dht.begin();
    
    Serial.begin(9600);
    while (!Serial);
    
    // 試圖連線到wifi裝置
    while (status != WL_CONNECTED) {
        Serial.print("Attempting to connect to SSID: ");
        Serial.println(ssid);
        // 使用 WPA/WPA2 網路連線
        status = WiFi.begin(ssid, pass);
    }
    Serial.println("Connected to wifi");
    printWifiStatus();
}

void loop() {
    // 如果伺服器有回應(response)，則印出資料
    while (client.available()) {
        char c = client.read();
        Serial.write(c);
    }
    // 延時2秒
    delay(2000);
    // 如果沒成功讀出溫度或濕度，重新讀取

    // 讀取溫溼度
    readTempHumid();
    
    // 如果溫度或濕度讀取失敗，重新讀取
     if(isnan(temp) || isnan(humid)) {
      Serial.println('Read dht11 fail');
      return;
    }
   
    // 使用POST請求資料到伺服器
    postData();
}

void printWifiStatus() {
    // 印出linkit7697連線到的wifi SSID
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());

    // 印出linkit7697連線到的wifi 區域ip
    IPAddress ip = WiFi.localIP();
    Serial.print("IP Address: ");
    Serial.println(ip);

    // 印出linkit7697連線到的wifi 信號強度
    long rssi = WiFi.RSSI();
    Serial.print("signal strength (RSSI):");
    Serial.print(rssi);
    Serial.println(" dBm");
}

// 讀取溫溼度
void readTempHumid() {
  // 讀取濕度 (%)
  humid = dht.readHumidity();
  // 讀取溫度 (*C)
  temp = dht.readTemperature();
}


// 使用POST請求資料到伺服器
void postData() {
      Serial.println("\nStarting connection to server...");
    // 如果有連線，則開始傳出http的請求
    if (client.connect(host.c_str(), port)) {
        // 傳出的Json格式字串
        postJson = "{ \"id\":" + (String)id +  ", \"temp\":" + (String)temp + ", \"humid\":" + (String)humid + "}";
        id++;
        Serial.println(postJson);
        Serial.println("connected to server (POST)");
        
        // 開始http請求
        // headers
        client.println("POST " + postUrl + " HTTP/1.1");
        client.println("Host: " + host + ":" + (String)port);
        client.println("Content-Type: application/json; charset=utf-8");
        client.println("Content-Length: " + (String)postJson.length());
        client.println("Connection: keep-alive");
        client.println("Accept: */*");
        client.println();
        
        // body
        client.println(postJson);
        client.println();

        delay(10);
    }
}
