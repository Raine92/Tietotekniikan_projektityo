#  GAME-STOCK v2

**GAME-STOCK v2** on moderni Node.js/React-pohjainen varastonhallintajärjestelmä videopelien keräilijöille ja jälleenmyyjille. 
Sovellus laskee automaattisesti pelien omakustannehinnan ostoerien (Batch) perusteella ja hakee markkinahinnat useista eri lähteistä.

---

##  Ominaisuudet
* **Markkinahintojen seuranta**: Automaattinen haku lähteistä: eBay, VPD, RetroGameTycoon ja PriceCharting.
* **Älykäs hinnoittelu**: Laskee pelin laskennallisen ostohinnan jakamalla ostoerän hinnan siinä olevien pelien määrällä.
* **Kuvien hallinta**: Lataa pelien kannet suoraan järjestelmään ja tallenna ne palvelimelle.
* **Täysi CRUD**: Lisää, muokkaa, päivitä ja poista pelejä sekä ostoeriä.
* **Haku-linkit**: Suorat linkit hintalähteisiin hinnan tarkistusta varten.

---

##  Esivaatimukset
Varmista, että koneellasi on:
* **Node.js** (v20 tai uudempi)
* **MongoDB Community Server** (tietokantamoottori)   https://www.mongodb.com/try/download/community
* **Scrapfly API-avain** (eBay-hintojen hakuun)  Kysy Samulilta :D

---

##  Asennus ja käyttöönotto

### 1. Projektin lataus
```bash
git clone [https://github.com/Raine92/Tietotekniikan_projektityo]
cd varastonhallintajarjstelma
```


### 2. Backendin määritys
1. Mene backend-kansioon: `cd backend`
2. Asenna riippuvuudet: `npm install`
3. Luo tiedosto `.env` ja lisää seuraavat tiedot:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/peli_varasto
   SCRAPFLY_API_KEY=tähän_samulin_avain
Huom: Portti 5000 on oletus, jota frontend kutsuu.

### 3. Frontenden määritys
1. Mene frontend-kansioon: cd ../frontend
2. Asenna riippuvuudet: npm install


### 4. Käynnistäminen
Sovellus vaatii kaksi terminaalia toimiakseen samanaikaisesti:
Terminaalissa. 
1. Backend npm run dev    http://localhost:5000
2. Frontend npm run dev    http://localhost:5173

### 5. Hyvä tietää
MongoDB Compass: Suositellaan tietokannan graafiseen tarkasteluun (yhdistä: mongodb://localhost:27017)
Hintojen haku: eBay-hinnat käyttävät mediaania vääristymien välttämiseksi.Muut lähteet haetaan Puppeteer-skreippauksella.
Kuvat: Kuvat tallentuvat paikallisesti palvelimelle backend/uploads/ -kansioon.
Haku-linkit: Hintalaatikot toimivat suorina linkkeinä alkuperäisiin hakutuloksiin.
