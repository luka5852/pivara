#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include "SPIFFS.h"

// Replace with your network credentials
const char* ssid = "pivara";
const char* password = "test1pivara";

#define Pin_Temperatura_Piva 34
#define Pin_Pumpa_Piva 2
#define Pin_Pumpa_Voda 2
#define Pin_Grijac 2


//Stanja velicina brewera
int Temperatura_Piva = 0;
bool Pumpa_Piva_Stanje = false;
bool Pumpa_Voda_Stanje = false;
bool Grijac = false;

IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);


AsyncWebServer server(80); // Create AsyncWebServer object on port 80

void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);
  pinMode(Pin_Pumpa_Piva, OUTPUT);
  
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
    if(Pumpa_Piva_Stanje){
      Pumpa_Piva_Stanje = false;
      digitalWrite(Pin_Pumpa_Piva, HIGH);
    }
    else{
      Pumpa_Piva_Stanje = true;
      digitalWrite(Pin_Pumpa_Piva, LOW);
    }
    request->send(200, "text/plain", "Uspjesno ukljucena pumpa piva");
});

server.on("/PREKIDAC_PUMPA_VODA", [](AsyncWebServerRequest *request){
    if(Pumpa_Piva_Stanje){
      Pumpa_Piva_Stanje = false;
      digitalWrite(Pin_Pumpa_Voda, HIGH);
    }
    else{
      Pumpa_Piva_Stanje = true;
      digitalWrite(Pin_Pumpa_Voda, LOW);
    }
    request->send(200, "text/plain", "Uspjesno ukljucena pumpa vode");
});

  // Start server
  server.begin();
}

void loop(){


}
