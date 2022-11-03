#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include "SPIFFS.h"

// Replace with your network credentials
const char* ssid = "pivara";
const char* password = "test1pivara";


const int ledPin = 2; // Set LED GPIO

String ledState; // Stores LED state
bool dugme_pumpa = false; // TEST 1 SA PUMPOM

IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);


AsyncWebServer server(80); // Create AsyncWebServer object on port 80


void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  
  WiFi.softAP(ssid, password);s
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
    
  server.on("/PUMPA_PIVA", HTTP_GET, [](AsyncWebServerRequest *request){
    if(dugme_pumpa){
      digitalWrite(ledPin, LOW);
      dugme_pumpa = false;
    }
    else{
      digitalWrite(ledPin, HIGH);
      dugme_pumpa = true;
    }
    request->send(SPIFFS, "/index.html", String(), false);
  });
  
  server.on("/PUMPA_VODE", HTTP_GET, [](AsyncWebServerRequest *request){
    if(dugme_pumpa){
      digitalWrite(ledPin, LOW);
      dugme_pumpa = false;
    }
    else{
      digitalWrite(ledPin, HIGH);
      dugme_pumpa = true;
    }
    request->send(SPIFFS, "/index.html", String(), false);
  });
  
  
  
  
  // Start server
  server.begin();
}

void loop(){


}
