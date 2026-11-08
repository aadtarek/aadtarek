# Techi Platform — بيت ذكي من غير Tuya

```
أجهزة Zigbee ──► Zigbee2MQTT ──┐
أجهزة Wi-Fi (Tuya) ── على الشبكة ─┤──► Techi Hub (في بيت العميل) ──► Techi Relay (السحابة) ──► موقع Techi /my-home
                                   │      - أتمتة وسيناريوهات من غير نت
                                   └──    - API على الشبكة المحلية
```

## 1. Techi Hub (`hub/`)
بيشتغل على Raspberry Pi 4/5 (أو أي كمبيوتر صغير) في البيت أو الشوروم.

### تجربة من غير أجهزة
```bash
cd hub && npm install && TECHI_TOKEN=my-secret npm run sim
```
بعدين افتح الموقع → **بيتي** → "من جوه البيت" → `http://localhost:8787` وكود الدخول `my-secret`.

### تشغيل حقيقي
1. **Zigbee:** ركّب دونجل Zigbee (مثلًا Sonoff ZBDongle-E) وشغّل
   [Mosquitto](https://mosquitto.org) و [Zigbee2MQTT](https://www.zigbee2mqtt.io/guide/installation/).
   اعمل pairing لأجهزة Zigbee (السويتشات، حساس الغاز، الحركة، المحبس) من واجهة Zigbee2MQTT،
   وسمّي كل جهاز بالاسم اللي في `address` في ملف الأجهزة.
2. **Wi-Fi (Tuya):** كل جهاز محتاج `id` و `local key` و IP. الـ local key بيتجاب **مرة واحدة**
   (مثلًا بأداة `tinytuya wizard`)، وبعد كده الجهاز بيتحكم فيه على الشبكة المحلية من غير سحابة Tuya.
   البديل: تغيير السوفتوير لـ OpenBeken/ESPHome لو الشريحة مدعومة.
3. انسخ `devices.example.json` لـ `devices.json` وعدّله (الأجهزة، الغرف، الأتمتة، السيناريوهات، `hub.token`).
4. `npm start` (ويُفضل تشغيله كخدمة systemd).

### الأمان
- كل طلب لازم كود الدخول (`hub.token`) — خليه طويل وعشوائي.
- الحساسات للقراءة بس، والكوالين **مش** بتتفتح من المنصة (تفضل على أبلكيشنها).
- حد 12 أمر في الثانية لكل اتصال، وقيم الأوامر بتتراجع (مثلًا التكييف من 16 لـ 30 بس).
- الـ Hub بيتصل **لبره** بالسحابة، فمفيش بورتات مفتوحة على راوتر العميل.

## 2. Techi Relay (`relay/`)
سيرفر صغير بيوصّل الموقع/الأبلكيشن بالـ Hub من أي مكان. لازم يشتغل على سيرفر دايم
(Render, Fly.io, Railway, أو VPS) **مش Vercel**، ووراه HTTPS عشان يبقى `wss://`.

```bash
cd relay && npm install
HUBS="showroom:$(printf %s 'HUB-SECRET' | sha256sum | cut -d' ' -f1)" npm start
```
وفي الـ Hub:
```
TECHI_RELAY=wss://cloud.techi-eg.com TECHI_HUB_ID=showroom TECHI_HUB_SECRET=HUB-SECRET npm start
```
في الموقع → **بيتي** → "من أي مكان": عنوان السحابة، رقم الـ Hub، وكود الدخول.

## اللي لسه (المرحلة 2)
حسابات للعملاء بدل كود لكل Hub، إشعارات على الموبايل، أبلكيشن موبايل، تحديثات أونلاين للـ Hub، ولوحة لفريق Techi تشوف كل الـ Hubs.
