#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include "SPIFFS.h"
#include "ArduinoJson.h"

// Replace with your network credentials
const char* ssid = "pivara";
const char* password = "test1pivara";

#define Pin_Temperatura_Piva 34
#define Pin_Pumpa_Piva 2
#define Pin_Pumpa_Voda 2
#define Pin_Grijac 2
#define Pin_Zeleni_Indikator 2
#define Pin_Crveni_Indikator 2

//Stanja velicina brewera
int Temperature_Hysteresis = 2;
int Sekunde = 0;
int Temperatura_Piva = 25;
int Trenutno_Vrijeme = 0;
int Trazeno_Vrijeme = 0;
int Trazena_Temperatura = 0;
bool Stanje_Kuvanja = false;
bool Pumpa_Piva_Stanje = false;
bool Pumpa_Voda_Stanje = false;
bool Grijac = false;
bool Indikator = false;

IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);

AsyncWebServer server(80); // Create AsyncWebServer object on port 80

//TAJMER ZA PROCES KUVANJA
hw_timer_t *My_timer = NULL;
void IRAM_ATTR onTimer(){
  ++Sekunde;
  if(Sekunde >= 60){
    Sekunde = 0;
    minut();
  }

  if(Indikator){
    Change_Grijac();
  }



}

void minut(){
  if(Indikator){
      if(Trenutno_Vrijeme < Trazeno_Vrijeme){
        Stanje_Kuvanja = false;
        ++Trenutno_Vrijeme;  
      }
      else{
        Stanje_Kuvanja = true;
      }
  }
  else{
      Trenutno_Vrijeme = 0;
  } 
}

void Change_Grijac(){
  if(Temperatura_Piva < Trazena_Temperatura + Temperature_Hysteresis){
      Grijac = true;
      Temperature_Hysteresis = 2;
  }
  else{
      Grijac = false;
      Temperature_Hysteresis = -2;
  }
}

void setup(){
  pinMode(Pin_Pumpa_Piva, OUTPUT);

  
  My_timer = timerBegin(0, 80, true);
  timerAttachInterrupt(My_timer, &onTimer, true);
  timerAlarmWrite(My_timer, 1000000, true);
  timerAlarmEnable(My_timer); //Just Enable
  Serial.begin(9600);
  
  WiFi.softAP(ssid, password);
  WiFi.softAPConfig(local_ip, gateway, subnet);
  delay(100);

    // Initialize SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
 
    // UCITAVANJE FAJLOVA U SPIFFS
  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", "text/html", false);
  });
  // Route to load style.css file
  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/style.css", "text/css");
  });
  // Route to load main.js file
  server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/main.js", "text/javascript");
  });
  // Route to load picture.png file
  server.on("/slike/brewer.png", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/slike/brewer.png", "image/png");
  });
    //ZAVRSENO UCITAVANJE FAJLOVA
    //FUNKCIJE HTTP REQUESTOVA
 
server.on("/PREKIDAC_PUMPA_PIVO", [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", "Uspjesno ukljucena pumpa piva");
});

server.on("/JSON", HTTP_POST, [](AsyncWebServerRequest *request){
    //nothing and dont remove it
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total){
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, (const char*)data);
    if(!error){
      if(Indikator != doc["stanje_pivare"]){
        Indikator = doc["stanje_pivare"];
        Trenutno_Vrijeme = 0;
      }
      Trazena_Temperatura = doc["trazena_temperatura"];
      Trazeno_Vrijeme = doc["trazeno_vrijeme"];
      Pumpa_Piva_Stanje = doc["pumpa_piva"];
      Pumpa_Voda_Stanje = doc["pumpa_vode"];
      
      const size_t CAPACITY = JSON_OBJECT_SIZE(5);
      StaticJsonDocument<CAPACITY> doc_1;
      doc_1["stanje_kuvanja"] = Stanje_Kuvanja;
      doc_1["temperatura_trenutna"] = String(Temperatura_Piva);
      doc_1["vrijeme_trenutno"] = Trenutno_Vrijeme;
      doc_1["grijac"] = Grijac;
      String tmp_json = "";
      serializeJsonPretty(doc_1, tmp_json);
           
      request->send(200, "text/plain", tmp_json);
    }
    else{
      request->send(404, "text/plain", "error");
    }
  });
  
  // Start server
  server.begin();
}

void loop(){
  if(Grijac){
    digitalWrite(Pin_Zeleni_Indikator, HIGH);
    ++Temperatura_Piva;
  }
  else{
    digitalWrite(Pin_Zeleni_Indikator, LOW);
    --Temperatura_Piva;
  }
  Serial.println(Temperatura_Piva);
  delay(1000);
}
