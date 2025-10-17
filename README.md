1.	Sprendžiamo uždavinio aprašymas
         1.1.	Sistemos paskirtis
Projekto tikslas – supaprastinti grįžtamojo ryšio anketų pildymą KTU IF seniūnams, leidžiant efektyviai valdyti apklausų kūrimą, atsakymų surinkimą ir analizę studentų atstovybės koordinatoriams.
Kuriama sistema leis koordinatoriams kurti formas su klausimais, skirti jas tam tikro kurso seniūnams, o šie gali pildyti pateiktas formas bei teikti atsakymus į klausimus.
Sistema suteikia centralizuotą būdą kaupti apklausų rezultatus bei užtikrinti atsekamumą tarp naudotojų.
Veikimo principas – platformą sudaro dvi dalys:
   •	Internetinė aplikacija , kuria naudosis koordinatoriai ir seniūnai (naudotojai);
   •	Serverio dalis (API), per kurią atliekami visi duomenų mainai tarp vartotojo sąsajos ir duomenų bazės.
Prisijungę prie sistemos:
   •	Administratoriai galės prisijungti, kurti klausimus, sudaryti apklausas ir peržiūrėti seniūnų pateiktus atsakymus.
   •	Seniūnai galės prisijungti, matyti jiems priskirtas aktyvias formas, pateikti atsakymus ir peržiūrėti savo pateiktus duomenis.
        1.2.	Funkciniai reikalavimai
Neregistruotas naudotojas galės:
   1.	Prisijungti prie sistemos naudodamas el. paštą ir slaptažodį.
   2.	Peržiūrėti aktyvias apklausas.
Registruotas naudotojas (seniūnas) galės:
   1.	Atsijungti nuo sistemos;
   2.	Pildyti jiems priskirtas apklausas;
   3.	Peržiūrėti savo pateiktas anketas ir atsakymus;
   4.	Redaguoti ar ištrinti savo atsakymus (jei forma dar aktyvi).
Koordinatorius galės:
   1.	Kurti naujus klausimus;
   2.	Kurti ir valdyti formas (apklausas);
   3.	Priskirti klausimus formoms;
   4.	Peržiūrėti pateiktas seniūnų formas ir jų atsakymus;
   5.	Aktyvuoti / deaktyvuoti formas;
   6.	Ištrinti formas ar klausimus, jei jie nenaudojami.
2.	Sistemos architektūra
Sistemos sudedamosios dalys: 
   • Kliento pusė (ang. Front-End) – naudojant React.js; 
   • Serverio pusė (angl. Back-End) – naudojant .NET entity framework core. Duomenų bazė – MySQL.
