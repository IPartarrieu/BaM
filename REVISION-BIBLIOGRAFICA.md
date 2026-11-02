# Revisión bibliográfica: diseño de rutinas de fuerza en BaM (adulto que vuelve a entrenar, orientado a BJJ)

Fecha: 2026-11-02

## Método y alcance

- Cada referencia se verificó en PubMed (E-utilities de NCBI): autor, año, revista, volumen/páginas, DOI y PMID. Para las fuentes clave también se leyó el resumen (abstract). **No se leyeron textos completos**: cuando una cifra viene del resumen se indica; las cifras que solo aparecen en el texto completo no se usan como evidencia.
- Niveles de evidencia usados:
  - **Fuerte**: varios meta-análisis o posicionamientos coinciden, o hay un ECA grande y bien hecho.
  - **Moderada**: un meta-análisis o revisión sistemática con heterogeneidad, o varios ECA pequeños.
  - **Débil**: estudios agudos, poblaciones distintas (por ejemplo fútbol en vez de BJJ), consenso de expertos o inferencia propia.
- Se revisó el código de la app en `/home/ipartarrieu/Claude/APPs/BaM/docs/logic.js` y se simularon las rutinas que genera (`armarRutina`) para cada fase y duración. Las discrepancias se basan en esa simulación, no solo en los valores declarados.

### Hallazgo nuevo relevante
Existe un posicionamiento ACSM 2026 que reemplaza al de 2009: Currier et al. (2026), *Med Sci Sports Exerc* 58(4):851-872, PMID 41843416. Es una revisión de revisiones (137 revisiones sistemáticas, más de 30.000 participantes). Según su resumen, la fuerza mejora más con cargas ≥80 % 1RM, rango completo, 2-3 series, ejercicios **al inicio de la sesión** y **≥2 sesiones por semana**. La hipertrofia mejora con **≥10 series semanales** y sobrecarga excéntrica, y la potencia con cargas de 30-70 % 1RM y bajo volumen (≤24 repeticiones × series). El entrenamiento al fallo, el tipo de equipo, la estructura de las series y la periodización **no** mostraron efectos consistentes. En este documento sirve de referencia principal.

---

## 1. Tipo de entrenamiento y selección de ejercicios

**Recomendación**
- La base debe ser fuerza con cargas pesadas en ejercicios multiarticulares: bisagra de cadera, sentadilla, empuje horizontal y vertical, tracción horizontal y vertical. Se complementa con trabajo de agarre, core y prevención de lesiones.
- Barra libre y máquina sirven por igual para fuerza e hipertrofia. La fuerza es específica de la modalidad (se gana más en el tipo de equipo con que se entrena), así que conviene que los básicos sean con peso libre si la meta es fuerza "transferible".
- **Prevención (prioridad alta en un deportista de contacto)**: incluir curl nórdico y Copenhague de forma estable, no solo cuando sobra tiempo.
  - Nórdico: los programas que lo incluyen reducen las lesiones de isquiotibiales en torno al 50 % (RR 0,49; IC95 % 0,32-0,74; 15 estudios).
  - Copenhague: un solo ejercicio progresivo, 3 veces por semana en pretemporada y 1 vez por semana en temporada, redujo un 41 % el riesgo de problemas inguinales (OR 0,59) en un ECA por conglomerados con 652 futbolistas. Ocho semanas de Copenhague aumentaron un 36 % la fuerza excéntrica de aductores.
  - En general, el entrenamiento de fuerza reduce las lesiones deportivas a cerca de un tercio (RR 0,338), con relación dosis-respuesta.
- **BJJ**: en un ECA con 14 practicantes de BJJ, 4×4 a ≥85 % 1RM en sentadilla y press banca más dominadas al fallo, 3 veces por semana, mejoraron el 1RM (+15 % y +11 %), el salto CMJ (+9 %) y la resistencia muscular. El grupo que solo hizo BJJ no mejoró. Una revisión sistemática asocia la fuerza máxima, isométrica y de resistencia con el éxito en BJJ. Las lesiones en BJJ son muy frecuentes (91 % se lesionó entrenando), sobre todo esguinces y distensiones de dedos, extremidad superior y cuello.
- **Agarre**: los grapplers tienen más fuerza isométrica de agarre que los no entrenados, y la fuerza depende del tipo de agarre (estándar o de gi). **No encontré ningún ECA verificable sobre entrenamiento específico de agarre en BJJ**, así que la prescripción de agarre (colgarse del gi, pinch, farmer) se apoya en la especificidad y en la experiencia práctica, no en ensayos.
- **Core antirrotación**: el posicionamiento CSEP (Behm et al., 2010) indica que los ejercicios con peso libre de pie (sentadilla, peso muerto) activan el core tanto o más que los ejercicios sobre superficies inestables, y desaconseja la inestabilidad como modo principal. **No hay evidencia verificada específica para el "antirrotacional"** (pallof, landmine). Es una elección razonable pero débil en evidencia.

**Nivel de evidencia**: fuerza pesada multiarticular, **fuerte**. Nórdico, **fuerte** (en fútbol y otros deportes, no en BJJ). Copenhague, **moderada** (un ECA grande, solo en fútbol). Equivalencia entre peso libre y máquina, **moderada**. Fuerza en BJJ, **moderada-débil** (un ECA pequeño y una revisión descriptiva). Agarre y core antirrotación, **débil**.

**Fuentes**: Currier 2026 (ACSM); Haugen 2023; van Dyk 2019; Harøy 2019; Ishøi 2016; Lauersen 2018; Øvretveit & Tøien 2018; Andreato 2017; Petrisor 2019; Escobar-Molina 2023; Behm 2010.

**Discrepancias con la app**
- En la simulación de `armarRutina`, **el nórdico y la Copenhague casi nunca aparecen**: en Fuerza A de 60 min (fase base) salen solo pm_hex, jalón, hack y remo con barra. El nórdico aparece recién con 90 min y la Copenhague solo en la descarga de 90 min. Esto pasa porque ocupan el 4° y 5° lugar de la lista de piernas (`logic.js:17-18`) y el intercalado los deja al final. Son justo los ejercicios con mejor evidencia preventiva.

---

## 2. Intensidad (%1RM, RIR/RPE, rangos de repeticiones)

**Recomendación**
- Fuerza máxima: cargas ≥80 % 1RM (más o menos 3-6 repeticiones). En la red de meta-análisis (178 ECA), las prescripciones de carga alta (>80 %) fueron las mejores para fuerza.
- Hipertrofia: es parecida en un rango amplio de cargas (aproximadamente del 30 al 85 % 1RM) siempre que las series lleguen cerca del fallo. Por comodidad y seguridad conviene usar 6-12 repeticiones en accesorios.
- Potencia: 30-70 % 1RM con intención máxima de velocidad y bajo volumen (Currier 2026). Para potencia con cargas ligeras, el ACSM 2009 recomienda 3-5 series con 3-5 min de descanso.
- Cercanía al fallo: **la fuerza mejora de forma similar con distintos RIR**, mientras que la hipertrofia aumenta a medida que las series terminan más cerca del fallo (meta-regresiones de Robinson 2024). Entrenar al fallo no es necesario ni para fuerza ni para hipertrofia (Grgic 2022), y el ACSM 2026 tampoco encontró un efecto consistente del fallo.
- Por qué RPE 6-7 (3-4 RIR) al volver tras una pausa:
  1. La fuerza se gana casi igual con más RIR (Robinson 2024).
  2. La fatiga neuromuscular y las molestias percibidas crecen de forma lineal al acercarse al fallo. A las 24 h, la velocidad de levantamiento seguía un 3 % por debajo con fallo o 1 RIR, mientras que con 3 RIR estaba un 2 % por encima. A las 48 h las diferencias desaparecían (Refalo 2023).
  3. Quien tiene poca experiencia estima peor el RIR (Zourdos 2016), así que un objetivo de 3 RIR deja margen para el error.
  4. El ACSM 2009 considera "novato" a quien no ha entrenado en varios años, y la detención del entrenamiento reduce la fuerza de forma proporcional a su duración (Bosquet 2013).
- Escala: usar RPE basada en RIR (RPE 10 = fallo, 9 = 1 RIR, 8 = 2 RIR, 7 = 3 RIR) (Zourdos 2016; Helms 2016).

**Nivel de evidencia**: carga alta para fuerza, **fuerte**. Hipertrofia independiente de la carga, **fuerte**. Relación del RIR con fuerza e hipertrofia, **moderada** (meta-regresiones exploratorias con RIR estimado). RPE 6-7 al volver, **moderada-débil** (inferido de lo anterior; no hay ensayos en personas que retoman el entrenamiento).

**Fuentes**: Currier 2023; Currier 2026; Lopez 2021; Schoenfeld 2021; Robinson 2024; Grgic 2022; Refalo 2023; Zourdos 2016; Helms 2016; ACSM 2009; Bosquet 2013.

**Discrepancias con la app**
- Las repeticiones son un número fijo ("5", "8", "10"), salvo los fondos ("8-12"). Esto choca con la doble progresión (ver tema 9).
- Las fases descarga y específica no declaran un RPE objetivo. Conviene fijarlo: descarga RPE 6-7 y específica RPE 7-8.

---

## 3. Volumen y frecuencia

**Recomendación**
- Hipertrofia: hay una relación dosis-respuesta. Cada serie semanal adicional suma alrededor de 0,37 % de ganancia muscular, con un umbral práctico de ≥10 series por músculo y semana (Schoenfeld 2017; Currier 2026). Contar los ejercicios multiarticulares como **media serie** para los músculos secundarios (método "fraccional", Pelland 2026).
- Fuerza: también hay dosis-respuesta, pero con rendimientos decrecientes mucho más marcados (Pelland 2026; Ralston 2017). Un mínimo de 1 serie de 6-12 repeticiones a 70-85 %, 2-3 veces por semana, ya produce ganancias (Androulakis-Korakakis 2020).
- Frecuencia: con el volumen igualado, no cambia la hipertrofia (Schoenfeld 2019). Para la fuerza, más frecuencia sí suma, con rendimientos decrecientes (Pelland 2026), y el ACSM 2026 recomienda **≥2 sesiones por semana por músculo**. En Grgic 2018 el efecto de la frecuencia sobre la fuerza se explica sobre todo por el volumen.
- Por sesión: unas 2-4 series por ejercicio y 6-10 series por músculo como máximo.
- Tendones al volver: los tendones se adaptan sobre todo según la **magnitud de la carga** (no según el tipo de contracción), con efectos mayores en intervenciones de ≥12 semanas (Bohm 2015). La idea de que el tendón se adapta más lento que el músculo y que por eso hay que limitar la intensidad las primeras semanas es **probable, pero no la verifiqué con una fuente específica**. La recomendación práctica: 3-4 semanas de volumen moderado y RPE 6-7, con cargas que aun así sean "reales" (≥65-70 % 1RM), porque el tendón necesita carga alta para adaptarse.

**Nivel de evidencia**: dosis-respuesta del volumen, **fuerte**. Frecuencia ≥2 por semana para fuerza, **moderada-fuerte**. Adaptación de tendones según la carga, **moderada**. Fase específica para tendones, **débil**.

**Fuentes**: Schoenfeld 2017; Pelland 2026; Ralston 2017; Baz-Valle 2022; Androulakis-Korakakis 2020; Schoenfeld 2019; Grgic 2018 (frecuencia); Currier 2026; Bohm 2015.

**Discrepancias con la app (importantes)**
- **Cada grupo muscular se entrena 1 vez por semana**: Fuerza A = piernas + espalda; Fuerza B = empuje + brazos + core o potencia (`logic.js:276-277`). La evidencia pide ≥2 por semana para la fuerza.
- **El volumen es bajo**. En 60 min, fase base, Fuerza A produce 10 series en total (pm_hex 3, jalón 3, hack 2, remo 2). Eso da unas 5 series directas de cuádriceps y glúteos, 5 de dorsales y 0 de isquiotibiales en curl. Queda bajo las 10 series semanales por músculo.
- **El factor de fase no reduce el volumen real**. Como el tiempo libre se llena con más ejercicios, la descarga produce el mismo total o más (ver tema 6).

---

## 4. Orden de los ejercicios

**Recomendación**
- La fuerza mejora más en los ejercicios que van **al principio** de la sesión: en el meta-análisis de Nunes 2021, empezar por multiarticulares favoreció la fuerza en multiarticulares (ES 0,32), y empezar por monoarticulares favoreció la fuerza en monoarticulares. La hipertrofia no dependió del orden (ES 0,03). Simão 2012 concluye que el orden debe seguir la **prioridad del objetivo**, más que el tamaño del músculo. El ACSM 2009 recomienda grandes antes que pequeños, multiarticulares antes que monoarticulares y mayor intensidad antes que menor. El ACSM 2026 confirma que la fuerza mejora más cuando el ejercicio va al inicio de la sesión.
- Potencia y explosivos (saltos, swing, lanzamientos): **primero**, sin fatiga previa. Es una inferencia del principio de "mayor intensidad primero" (ACSM 2009) y de que la fatiga reduce la velocidad (Refalo 2023). No encontré un ensayo verificado que compare el orden de los ejercicios de potencia.
- Series alternadas o pareadas (intercalar grupos): en practicantes de BJJ, las series alternadas lograron **el mismo volumen-carga en menos tiempo**, aunque con más RPE y más lactato (Belo 2020). Las series pareadas agonista-antagonista (press banca y remo) incluso aumentaron el volumen-carga (Paz 2017). El ACSM 2026 no encontró efecto de la estructura de las series. **Intercalar es válido**, siempre que no se mezclen dos ejercicios que fatigan lo mismo.
- Core al final: es razonable. Un core fatigado antes de sentadilla o peso muerto puede quitar estabilidad (inferencia, evidencia débil).
- Agarre y antebrazos antes de tracción o bisagra: **no encontré estudios directos**. Por el principio de prioridad (Simão 2012; Nunes 2021) y la revisión de pre-agotamiento (Trindade 2022, sin beneficio crónico del pre-agotamiento), conviene que los ejercicios de agarre vayan **después** de los ejercicios donde el agarre limita la carga (peso muerto, remo, jalón, dominadas). Evidencia débil.

**Nivel de evidencia**: prioridad al inicio para la fuerza, **moderada**. Orden sin efecto en la hipertrofia, **moderada**. Series alternadas válidas, **moderada** (estudios agudos). Explosivos primero, **débil-moderada**. Agarre al final, **débil**.

**Fuentes**: Nunes 2021; Simão 2012; ACSM 2009; Currier 2026; Belo 2020; Paz 2017; Trindade 2022.

**Discrepancias con la app**
- El intercalado (`logic.js:82`) toma el 1° de cada grupo, después el 2° de cada grupo, y así. En Fuerza B de construcción sale: press inclinado, curl martillo, **swing**, militar, curl reverso, **salto al cajón**. **Los explosivos quedan después del press y del curl.**
- En la sustitución, `alternativas` usa músculos compartidos y no el patrón de movimiento (ver tema 8).

---

## 5. Descanso entre series

**Recomendación**
- Fuerza en multiarticulares pesados: **≥2 min** en personas entrenadas. En no entrenados, 60-120 s alcanzan (Grgic 2018, revisión de 23 estudios). En un ECA con hombres entrenados (8-12 RM), descansar 3 min dio más fuerza y más hipertrofia que descansar 1 min (Schoenfeld 2016). El ACSM 2009 recomienda 3-5 min para cargas pesadas (1-6 RM) y 1-2 min para hipertrofia (6-12 RM).
- Hipertrofia: hay un pequeño beneficio al descansar **más de 60 s**, y **no hay diferencias apreciables por encima de 90 s** (Singer 2024, meta-análisis bayesiano de 9 estudios). En accesorios, 60-90 s es suficiente; 90 s es el "punto dulce".
- Potencia: recuperación completa. El ACSM 2009 da 3-5 min para potencia con cargas ligeras; en la práctica, 2-3 min para saltos y lanzamientos de pocas repeticiones.
- Resistencia local y core: <90 s (ACSM 2009).

**Nivel de evidencia**: ≥2 min en multiarticulares pesados, **moderada** (fuerte en entrenados, menor en quien vuelve). Rango de 60-90 s para hipertrofia, **moderada**. Potencia con descanso largo, **débil-moderada** (posicionamiento, sin meta-análisis).

**Fuentes**: Grgic 2018 (descanso); Schoenfeld 2016; Singer 2024; ACSM 2009.

**Discrepancias con la app**: ver la tabla de ajustes al final. En general, los multiarticulares están en 90 s (pocos para fuerza) y los explosivos en 60-90 s (pocos para potencia).

---

## 6. Recuperación entre sesiones, entrenamiento concurrente, sueño y descarga

**Recomendación**
- **48 h** entre sesiones que cargan el mismo músculo con intensidad alta. Incluso entrenando al fallo, las diferencias de fatiga (velocidad de levantamiento) desaparecen a las 48 h (Refalo 2023). El rango de 48-72 h es una convención; **no encontré un meta-análisis que lo pruebe**.
- Concurrente (fuerza + cardio + BJJ):
  - El meta-análisis actualizado (Schumann 2022, 43 estudios) **no encuentra interferencia en la fuerza máxima ni en la hipertrofia**, pero sí en la **fuerza explosiva** (SMD −0,28). Esa interferencia es mayor cuando el cardio y la fuerza se hacen en la misma sesión que cuando se separan **≥3 h**.
  - Wilson 2012: la interferencia depende de la modalidad (más con correr que con bicicleta), de la frecuencia y de la duración del cardio.
  - Murach & Bagley 2016: la interferencia en la hipertrofia es menor de lo que se creía.
  - Robineau 2016 (ECA en jugadores de rugby): con 0 h entre sesiones la fuerza mejoró menos que con 6 h o 24 h. Recomiendan **≥6 h** entre cualidades opuestas.
  - Si van en la misma sesión, la fuerza primero (Eddens 2018 estudia esta secuencia; solo leí el título y los metadatos, así que se cita como apoyo secundario).
- Sueño: la restricción de sueño durante varias noches reduce la fuerza en ejercicios multiarticulares, no en monoarticulares (Knowles 2018). Si hubo mala noche, conviene bajar la carga de los básicos (RPE objetivo −1).
- Descarga y tapering: lo óptimo es una reducción de **2 semanas** con el **volumen 41-60 % más bajo**, manteniendo **la intensidad y la frecuencia** (Bosquet 2007, meta-análisis de 27 estudios). Una semana **sin entrenar nada** a mitad de un programa de 9 semanas no mejoró la hipertrofia y empeoró levemente la fuerza (Coleman 2024). Por eso conviene bajar el volumen y no parar.

**Nivel de evidencia**: concurrente sin interferencia en fuerza e hipertrofia, **fuerte**; interferencia en potencia, **moderada**. Separación de ≥6 h, **moderada-débil** (un ECA). Sueño, **moderada-débil**. Tapering, **fuerte** (pero en deportes de resistencia, no de fuerza). Descarga, **débil** (un ECA).

**Fuentes**: Refalo 2023; Schumann 2022; Wilson 2012; Murach & Bagley 2016; Robineau 2016; Eddens 2018; Knowles 2018; Bosquet 2007; Coleman 2024.

**Discrepancias con la app (importantes)**
- **La descarga no reduce el volumen**. El factor 0,6 baja las series por ejercicio, pero `armarRutina` llena el tiempo libre con más ejercicios. En 60 min de Fuerza A, base y construcción dan 10 series y la descarga también da 10 (5 ejercicios × 2). En Fuerza B de 60 min, construcción da 18 series y descarga 15 (−17 %, lejos del 41-60 %).
- **La descarga elimina Fuerza B** (`fijas: ['fuerzaA', 'rounds']`, `logic.js:248`). Empuje y brazos quedan sin estímulo esa semana: baja la frecuencia, contrario a Bosquet 2007.
- `Math.max(2, …)` hace que los ejercicios de 3 series queden en 2 tanto en la base (0,75) como en la descarga (0,6), así que el factor no diferencia esas fases.

---

## 7. Calentamiento y elongación

**Recomendación**
- Calentamiento activo general de 5-10 min más un **calentamiento específico con series de aproximación** del primer ejercicio de cada patrón, por ejemplo 40-50 % × 5-8 y 60-70 % × 3 (o 1-2 series a 80 % × 1-2 en días pesados).
  - El calentamiento mejora el rendimiento en el 79 % de los criterios estudiados (Fradkin 2010).
  - Hay evidencia fuerte de que los calentamientos dinámicos con carga alta mejoran la fuerza y la potencia del tren superior (McCrary 2015).
  - Bishop 2003 advierte que no debe generar fatiga.
  - Ribeiro 2014 no encontró diferencias en repeticiones a 80 % 1RM según el tipo de calentamiento. La evidencia sobre series de aproximación es mixta, pero no perjudica.
- Estiramiento estático previo: reduce la fuerza un **−5,4 %** en promedio. El efecto es mínimo con ≤45 s por músculo (Simic 2013): con ≥60 s por músculo la caída es de −4,6 %, y con <60 s de −1,1 %. Si después se hace actividad dinámica, el efecto se diluye (Behm 2016). Conclusión: evitar el estático largo antes de levantar, o limitarlo a <30-45 s y seguirlo con trabajo dinámico.
- Elongación al final: **mejora el rango de movimiento** y reduce la rigidez, pero **no mejora la recuperación** ni el dolor muscular tardío (Afonso 2021: ES ≈ 0 para fuerza y DOMS a 24-72 h). Según el consenso Delphi de Warneke 2025, **no es una estrategia general de prevención de lesiones**. En BJJ el rango de movimiento sí tiene valor (guardia, 90/90), así que mantenerla tiene sentido, pero con el objetivo correcto.

**Nivel de evidencia**: calentamiento activo, **moderada**. Series de aproximación, **débil-moderada**. Efecto del estático según la duración, **fuerte**. Elongación que no previene lesiones ni mejora la recuperación, **moderada-fuerte**.

**Fuentes**: Fradkin 2010; McCrary 2015; Bishop 2003; Ribeiro 2014; Simic 2013; Behm 2016; Afonso 2021; Warneke 2025.

**Discrepancias con la app**
- El calentamiento (`logic.js:48`) es solo articular: incluye "Estiramiento de espalda", que si es estático conviene que sea breve, y **no incluye series de aproximación** para pm_hex, press inclinado o jalón.
- La elongación de 5 min al final está bien, pero el texto de la app no debe venderla como "recuperación" ni como "prevención".

---

## 8. Sustitución de ejercicios (equipo ocupado, dolor, falta de espacio)

**Recomendación**
- Sustituir por un ejercicio del **mismo patrón y la misma demanda** (tipo de acción, rango, carga posible) y mantener las series, el RIR y las repeticiones.
  - Peso libre y máquina dan una fuerza e hipertrofia equivalentes en comparación directa (Haugen 2023).
  - La variación sistemática de ejercicios no perjudica y puede mejorar la hipertrofia regional. Lo que perjudica es la **rotación excesiva o aleatoria** (Kassiano 2022; Fonseca 2014).
- Algunos ejercicios tienen un "por qué" específico y su sustituto debe conservarlo:
  - Nórdico → curl femoral (flexión de rodilla con énfasis excéntrico), **no** peso muerto.
  - Copenhague → aducción en máquina o en polea, o aducción lateral en el suelo.
  - Explosivos → otro explosivo (salto ↔ swing ↔ lanzamiento), **no** un básico pesado.

**Nivel de evidencia**: equivalencia entre equipos, **moderada**. Variación sistemática sí y aleatoria no, **moderada-débil** (8 estudios, todos con hombres jóvenes). Conservar la especificidad de la prevención, **débil** (inferencia desde el mecanismo de van Dyk 2019 y Harøy 2019).

**Fuentes**: Haugen 2023; Kassiano 2022; Fonseca 2014.

**Discrepancias con la app**
- `alternativas` (`logic.js:103-109`) ordena por cantidad de músculos compartidos. En la simulación:
  - pm_hex → **swing** primero (un explosivo liviano en lugar de una bisagra pesada).
  - Copenhague → **hack** primero (sentadilla en lugar de aductor aislado).
  - Nórdico → **pm_hex** primero (bisagra en lugar de flexión excéntrica de rodilla).
  - Salto al cajón → **pm_hex** primero.
- Conviene agregar a cada ejercicio un campo de patrón (`p: 'bisagra' | 'sentadilla' | 'flexion_rodilla' | 'aductor' | 'empuje_h' | 'empuje_v' | 'traccion_h' | 'traccion_v' | 'explosivo' | 'agarre'`) y ofrecer primero los del mismo patrón. También falta en la lista un curl femoral y una aducción en máquina.

---

## 9. Progresión

**Recomendación**
- Doble progresión: definir un **rango** de repeticiones (por ejemplo 6-8) y subir la carga cuando todas las series lleguen al tope del rango **con el RPE objetivo o por debajo**.
- El ACSM 2009 indica subir un **2-10 %** cuando se pueden hacer 1-2 repeticiones por sobre el objetivo.
- Progresar en repeticiones con la carga fija también funciona, con resultados similares en hipertrofia y fuerza (Plotkin 2022). Es útil con mancuernas o kettlebells, donde el salto mínimo de carga es grande.
- Incremento: 2,5 kg en barra para tren inferior y básicos (≈2-4 %). En tren superior y mancuernas, el salto mínimo disponible (1-2 kg) o progresar primero en repeticiones.

**Nivel de evidencia**: principio de sobrecarga progresiva, **fuerte**. Porcentaje concreto del 2-10 %, **débil-moderada** (posicionamiento). Equivalencia entre progresar en carga o en repeticiones, **moderada** (un ECA).

**Fuentes**: ACSM 2009; Plotkin 2022; Currier 2026.

**Discrepancias con la app**
- `sugerirKg` (`logic.js:114-124`) suma **2,5 kg fijos** a cualquier ejercicio. En curl martillo (10 kg) eso es +25 % y en face pull (15 kg) +17 %, muy por encima del 2-10 %.
- Como las repeticiones son fijas ("8") y la fase base pide RPE 6-7, el usuario **siempre** completará el tope. La app sugerirá +2,5 kg **en cada sesión** sin mirar el RPE. Eso no es doble progresión: es progresión lineal sin control del esfuerzo.
- No usa el RPE registrado (la app lo guarda, `app.js:324`) como condición para subir.

---

## Lista de referencias verificadas (APA breve)

Todas verificadas en PubMed (autor, año, revista, DOI, PMID). Las marcadas con * se leyeron también en su resumen.

1. *American College of Sports Medicine. (2009). Progression models in resistance training for healthy adults. *Med Sci Sports Exerc, 41*(3), 687-708. doi:10.1249/MSS.0b013e3181915670. PMID 19204579.
2. *Currier, B. S., et al. (2026). ACSM Position Stand. Resistance training prescription for muscle function, hypertrophy, and physical performance in healthy adults: An overview of reviews. *Med Sci Sports Exerc, 58*(4), 851-872. doi:10.1249/MSS.0000000000003897. PMID 41843416.
3. *Currier, B. S., Mcleod, J. C., et al. (2023). Resistance training prescription for muscle strength and hypertrophy in healthy adults: a systematic review and Bayesian network meta-analysis. *Br J Sports Med, 57*(18), 1211-1220. doi:10.1136/bjsports-2023-106807. PMID 37414459.
4. *Lopez, P., et al. (2021). Resistance training load effects on muscle hypertrophy and strength gain: Systematic review and network meta-analysis. *Med Sci Sports Exerc, 53*(6), 1206-1216. doi:10.1249/MSS.0000000000002585. PMID 33433148.
5. *Schoenfeld, B. J., Grgic, J., Van Every, D. W., & Plotkin, D. L. (2021). Loading recommendations for muscle strength, hypertrophy, and local endurance: A re-examination of the repetition continuum. *Sports (Basel), 9*(2), 32. doi:10.3390/sports9020032. PMID 33671664.
6. *Robinson, Z. P., et al. (2024). Exploring the dose-response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy: A series of meta-regressions. *Sports Med, 54*(9), 2209-2231. doi:10.1007/s40279-024-02069-2. PMID 38970765.
7. *Grgic, J., et al. (2022). Effects of resistance training performed to repetition failure or non-failure on muscular strength and hypertrophy: A systematic review and meta-analysis. *J Sport Health Sci, 11*(2), 202-211. doi:10.1016/j.jshs.2021.01.007. PMID 33497853.
8. *Refalo, M. C., et al. (2023). Influence of resistance training proximity-to-failure, determined by repetitions-in-reserve, on neuromuscular fatigue in resistance-trained males and females. *Sports Med Open, 9*(1), 10. doi:10.1186/s40798-023-00554-y. PMID 36752989.
9. *Zourdos, M. C., et al. (2016). Novel resistance training-specific rating of perceived exertion scale measuring repetitions in reserve. *J Strength Cond Res, 30*(1), 267-275. doi:10.1519/JSC.0000000000001049. PMID 26049792.
10. *Helms, E. R., et al. (2016). Application of the repetitions in reserve-based rating of perceived exertion scale for resistance training. *Strength Cond J, 38*(4), 42-49. doi:10.1519/SSC.0000000000000218. PMID 27531969.
11. *Bosquet, L., et al. (2013). Effect of training cessation on muscular performance: A meta-analysis. *Scand J Med Sci Sports, 23*(3), e140-e149. doi:10.1111/sms.12047. PMID 23347054.
12. *Schoenfeld, B. J., Ogborn, D., & Krieger, J. W. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis. *J Sports Sci, 35*(11), 1073-1082. doi:10.1080/02640414.2016.1210197. PMID 27433992.
13. *Pelland, J. C., et al. (2026). The resistance training dose response: Meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains. *Sports Med, 56*(2), 481-505. doi:10.1007/s40279-025-02344-w. PMID 41343037.
14. *Ralston, G. W., et al. (2017). The effect of weekly set volume on strength gain: A meta-analysis. *Sports Med, 47*(12), 2585-2601. doi:10.1007/s40279-017-0762-7. PMID 28755103.
15. Baz-Valle, E., et al. (2022). A systematic review of the effects of different resistance training volumes on muscle hypertrophy. *J Hum Kinet, 81*, 199-210. doi:10.2478/hukin-2022-0017. PMID 35291645.
16. *Androulakis-Korakakis, P., et al. (2020). The minimum effective training dose required to increase 1RM strength in resistance-trained men: A systematic review and meta-analysis. *Sports Med, 50*(4), 751-765. doi:10.1007/s40279-019-01236-0. PMID 31797219.
17. *Schoenfeld, B. J., Grgic, J., & Krieger, J. (2019). How many times per week should a muscle be trained to maximize muscle hypertrophy? A systematic review and meta-analysis. *J Sports Sci, 37*(11), 1286-1295. doi:10.1080/02640414.2018.1555906. PMID 30558493.
18. *Grgic, J., et al. (2018). Effect of resistance training frequency on gains in muscular strength: A systematic review and meta-analysis. *Sports Med, 48*(5), 1207-1220. doi:10.1007/s40279-018-0872-x. PMID 29470825.
19. *Bohm, S., Mersmann, F., & Arampatzis, A. (2015). Human tendon adaptation in response to mechanical loading: A systematic review and meta-analysis of exercise intervention studies on healthy adults. *Sports Med Open, 1*(1), 7. doi:10.1186/s40798-015-0009-9. PMID 27747846.
20. *Simão, R., et al. (2012). Exercise order in resistance training. *Sports Med, 42*(3), 251-265. doi:10.2165/11597240-000000000-00000. PMID 22292516.
21. *Nunes, J. P., et al. (2021). What influence does resistance exercise order have on muscular strength gains and muscle hypertrophy? A systematic review and meta-analysis. *Eur J Sport Sci, 21*(2), 149-157. doi:10.1080/17461391.2020.1733672. PMID 32077380.
22. *Belo, W. R., Øvretveit, K., et al. (2020). The effects of straight and alternating sets on volume load, training efficiency, and metabolic response in grapplers. *J Sports Med Phys Fitness, 60*(5), 713-719. doi:10.23736/S0022-4707.20.10490-0. PMID 32438787.
23. *Paz, G. A., et al. (2017). Volume load and neuromuscular fatigue during an acute bout of agonist-antagonist paired-set vs. traditional-set training. *J Strength Cond Res, 31*(10), 2777-2784. doi:10.1519/JSC.0000000000001059. PMID 28933712.
24. *Trindade, T. B., et al. (2022). Pre-exhaustion training, a narrative review of the acute responses and chronic adaptations. *Int J Exerc Sci, 15*(3), 507-525. doi:10.70252/CEVS9112. PMID 35516415.
25. *Schoenfeld, B. J., et al. (2016). Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. *J Strength Cond Res, 30*(7), 1805-1812. doi:10.1519/JSC.0000000000001272. PMID 26605807.
26. *Grgic, J., et al. (2018). Effects of rest interval duration in resistance training on measures of muscular strength: A systematic review. *Sports Med, 48*(1), 137-151. doi:10.1007/s40279-017-0788-x. PMID 28933024.
27. *Singer, A., et al. (2024). Give it a rest: A systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy. *Front Sports Act Living, 6*, 1429789. doi:10.3389/fspor.2024.1429789. PMID 39205815.
28. *Schumann, M., et al. (2022). Compatibility of concurrent aerobic and strength training for skeletal muscle size and function: An updated systematic review and meta-analysis. *Sports Med, 52*(3), 601-612. doi:10.1007/s40279-021-01587-7. PMID 34757594.
29. *Wilson, J. M., et al. (2012). Concurrent training: A meta-analysis examining interference of aerobic and resistance exercises. *J Strength Cond Res, 26*(8), 2293-2307. doi:10.1519/JSC.0b013e31823a3e2d. PMID 22002517.
30. *Murach, K. A., & Bagley, J. R. (2016). Skeletal muscle hypertrophy with concurrent exercise training: Contrary evidence for an interference effect. *Sports Med, 46*(8), 1029-1039. doi:10.1007/s40279-016-0496-y. PMID 26932769.
31. *Robineau, J., et al. (2016). Specific training effects of concurrent aerobic and strength exercises depend on recovery duration. *J Strength Cond Res, 30*(3), 672-683. doi:10.1519/JSC.0000000000000798. PMID 25546450.
32. Eddens, L., van Someren, K., & Howatson, G. (2018). The role of intra-session exercise sequence in the interference effect: A systematic review with meta-analysis. *Sports Med, 48*(1), 177-188. doi:10.1007/s40279-017-0784-1. PMID 28917030. (Solo metadatos; no leí el resumen.)
33. *Knowles, O. E., et al. (2018). Inadequate sleep and muscle strength: Implications for resistance training. *J Sci Med Sport, 21*(9), 959-968. doi:10.1016/j.jsams.2018.01.012. PMID 29422383.
34. *Bosquet, L., et al. (2007). Effects of tapering on performance: A meta-analysis. *Med Sci Sports Exerc, 39*(8), 1358-1365. doi:10.1249/mss.0b013e31806010e0. PMID 17762369.
35. *Coleman, M., et al. (2024). Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations. *PeerJ, 12*, e16777. doi:10.7717/peerj.16777. PMID 38274324.
36. *Fradkin, A. J., Zazryn, T. R., & Smoliga, J. M. (2010). Effects of warming-up on physical performance: A systematic review with meta-analysis. *J Strength Cond Res, 24*(1), 140-148. doi:10.1519/JSC.0b013e3181c643a0. PMID 19996770.
37. *McCrary, J. M., Ackermann, B. J., & Halaki, M. (2015). A systematic review of the effects of upper body warm-up on performance and injury. *Br J Sports Med, 49*(14), 935-942. doi:10.1136/bjsports-2014-094228. PMID 25694615.
38. *Bishop, D. (2003). Warm up II: Performance changes following active warm up and how to structure the warm up. *Sports Med, 33*(7), 483-498. doi:10.2165/00007256-200333070-00002. PMID 12762825.
39. *Ribeiro, A. S., et al. (2014). Effect of different warm-up procedures on the performance of resistance training exercises. *Percept Mot Skills, 119*(1), 133-145. doi:10.2466/25.29.PMS.119c17z7. PMID 25153744.
40. *Simic, L., Sarabon, N., & Markovic, G. (2013). Does pre-exercise static stretching inhibit maximal muscular performance? A meta-analytical review. *Scand J Med Sci Sports, 23*(2), 131-148. doi:10.1111/j.1600-0838.2012.01444.x. PMID 22316148.
41. *Behm, D. G., Blazevich, A. J., Kay, A. D., & McHugh, M. (2016). Acute effects of muscle stretching on physical performance, range of motion, and injury incidence in healthy active individuals: A systematic review. *Appl Physiol Nutr Metab, 41*(1), 1-11. doi:10.1139/apnm-2015-0235. PMID 26642915.
42. *Afonso, J., et al. (2021). The effectiveness of post-exercise stretching in short-term and delayed recovery of strength, range of motion and delayed onset muscle soreness: A systematic review and meta-analysis of randomized controlled trials. *Front Physiol, 12*, 677581. doi:10.3389/fphys.2021.677581. PMID 34025459.
43. *Warneke, K., et al. (2025). Practical recommendations on stretching exercise: A Delphi consensus statement of international research experts. *J Sport Health Sci, 14*, 101067. doi:10.1016/j.jshs.2025.101067. PMID 40513717.
44. *Haugen, M. E., et al. (2023). Effect of free-weight vs. machine-based strength training on maximal strength, hypertrophy and jump performance: A systematic review and meta-analysis. *BMC Sports Sci Med Rehabil, 15*(1), 103. doi:10.1186/s13102-023-00713-4. PMID 37582807.
45. *Kassiano, W., et al. (2022). Does varying resistance exercises promote superior muscle hypertrophy and strength gains? A systematic review. *J Strength Cond Res, 36*(6), 1753-1762. doi:10.1519/JSC.0000000000004258. PMID 35438660.
46. *Fonseca, R. M., et al. (2014). Changes in exercises are more effective than in loading schemes to improve muscle strength. *J Strength Cond Res, 28*(11), 3085-3092. doi:10.1519/JSC.0000000000000539. PMID 24832974.
47. *Plotkin, D., et al. (2022). Progressive overload without progressing load? The effects of load or repetition progression on muscular adaptations. *PeerJ, 10*, e14142. doi:10.7717/peerj.14142. PMID 36199287.
48. *van Dyk, N., et al. (2019). Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: A systematic review and meta-analysis of 8459 athletes. *Br J Sports Med, 53*(21), 1362-1370. doi:10.1136/bjsports-2018-100045. PMID 30808663.
49. *Harøy, J., et al. (2019). The Adductor Strengthening Programme prevents groin problems among male football players: A cluster-randomised controlled trial. *Br J Sports Med, 53*(3), 150-157. doi:10.1136/bjsports-2017-098937. PMID 29891614.
50. *Ishøi, L., et al. (2016). Large eccentric strength increase using the Copenhagen Adduction exercise in football: A randomized controlled trial. *Scand J Med Sci Sports, 26*(11), 1334-1342. doi:10.1111/sms.12585. PMID 26589483.
51. *Lauersen, J. B., Andersen, T. E., & Andersen, L. B. (2018). Strength training as superior, dose-dependent and safe prevention of acute and overuse sports injuries: A systematic review, qualitative analysis and meta-analysis. *Br J Sports Med, 52*(24), 1557-1563. doi:10.1136/bjsports-2018-099078. PMID 30131332.
52. *Øvretveit, K., & Tøien, T. (2018). Maximal strength training improves strength performance in grapplers. *J Strength Cond Res, 32*(12), 3326-3332. doi:10.1519/JSC.0000000000002863. PMID 30247275.
53. *Øvretveit, K. (2018). Anthropometric and physiological characteristics of Brazilian jiu-jitsu athletes. *J Strength Cond Res, 32*(4), 997-1004. doi:10.1519/JSC.0000000000002471. PMID 29401194.
54. *Andreato, L. V., et al. (2017). Physical and physiological profiles of Brazilian jiu-jitsu athletes: A systematic review. *Sports Med Open, 3*(1), 9. doi:10.1186/s40798-016-0069-5. PMID 28194734.
55. *Petrisor, B. A., et al. (2019). Injury in Brazilian jiu-jitsu training. *Sports Health, 11*(5), 432-439. doi:10.1177/1941738119849112. PMID 31173700.
56. *Escobar-Molina, R., et al. (2023). Analysis of grip specificity on force production in grapplers and its effect on bilateral deficit grip specificity. *Front Sports Act Living, 5*, 1190369. doi:10.3389/fspor.2023.1190369. PMID 37822971.
57. *Behm, D. G., Drinkwater, E. J., Willardson, J. M., & Cowley, P. M. (2010). Canadian Society for Exercise Physiology position stand: The use of instability to train the core in athletic and nonathletic conditioning. *Appl Physiol Nutr Metab, 35*(1), 109-112. doi:10.1139/H09-128. PMID 20130673.

### Lo que no pude verificar o no incluí
- **Posicionamientos de la NSCA** (*Essentials of Strength Training and Conditioning*, guías de descanso de 2-5 min): son libros o documentos que no están en PubMed. No los cito.
- **La recomendación del ACSM 2009 de "2-3 min en ejercicios principales y 1-2 min en accesorios"**: aparece en el texto completo según la literatura secundaria, pero el resumen solo dice 3-5 min para cargas pesadas (1-6 RM) y 1-2 min para hipertrofia. Uso solo lo que aparece en el resumen.
- **El ACSM 2026**: solo leí el resumen. No sé si da descansos o frecuencias concretas en el texto completo.
- **Ventana de 48-72 h por grupo muscular**: no encontré un meta-análisis que la pruebe. Uso 48 h a partir de Refalo 2023 (los datos de fatiga se normalizan a las 48 h).
- **Que el tendón se adapta más lento que el músculo** (justificación de la fase base): probable, sin fuente verificada en esta revisión.
- **Entrenamiento de agarre en BJJ** y **agarre antes de tracción**: no hay ECA verificables. Lo que se recomienda es una inferencia.
- **Core antirrotación** (pallof, landmine con rotación): sin ensayos verificados de transferencia.
- **Murach & Bagley 2016 y Eddens 2018**: leí el resumen de Murach & Bagley, pero solo los metadatos de Eddens.

---

## Ajustes recomendados a la app

Ordenados por impacto (los de arriba tienen más respaldo y más efecto).

### A. Estructura semanal (lo más importante)
1. **Pasar de dividir por grupos (A = piernas + espalda, B = empuje + brazos) a cuerpo completo A/B**, para que cada patrón se entrene 2 veces por semana (Currier 2026; Pelland 2026). Por ejemplo:
   - A: explosivo → pm_hex → press inclinado → jalón → nórdico → agarre → core.
   - B: explosivo → hack → militar → remo con barra → Copenhague → agarre → core.
2. **Fijar el nórdico y la Copenhague** en cada sesión A y B con dosis baja: 2-3 series de nórdico (3-6 repeticiones) y 2-3 de Copenhague (15-30 s por lado), sin que dependan del tiempo libre (van Dyk 2019; Harøy 2019).
3. Objetivo de volumen: ≥10 series semanales efectivas por grupo grande en la fase de construcción, contando los multiarticulares como 0,5 serie para los músculos secundarios (Pelland 2026). En la fase base, 6-8.

### B. Orden (`armarRutina`, `logic.js:77-90`)
4. Ordenar por **prioridad** en lugar de intercalar a ciegas: (1) explosivos, (2) multiarticular pesado de tren inferior, (3) multiarticulares de tren superior, emparejando empuje con tracción, (4) prevención (nórdico, Copenhague), (5) accesorios, (6) agarre (pinch, farmer, colgarse), (7) core. Se puede mantener la alternancia empuje/tracción (Belo 2020; Paz 2017), pero **nunca** el agarre antes de pm_hex, remo, jalón o remo unilateral.
5. Si se recorta por tiempo, recortar desde el final de la lista de prioridad y nunca los explosivos ni los ejercicios de prevención.

### C. Descansos sugeridos por ejercicio

| Ejercicio | Actual | Sugerido | Motivo |
|---|---|---|---|
| Peso muerto hexagonal 4×5 | 150 s | **180 s** (150 en base) | Multiarticular pesado, ≥2 min (Grgic 2018; Schoenfeld 2016; ACSM 2009: 3-5 min con 1-6 RM) |
| Hack 3×8 | 90 s | **120-150 s** | Multiarticular de tren inferior |
| Hip thrust 3×10 | 90 s | **120 s** | Multiarticular, carga alta |
| Curl nórdico 3×6 | 90 s | **120 s** | Excéntrico máximo; la calidad de cada repetición importa (débil) |
| Copenhague 3×20 s por lado | 60 s | 60 s (está bien) | Isométrico y alternado por lado |
| Jalón 4×8 | 90 s | **120 s** | Multiarticular |
| Remo con barra 4×8 | 90 s | **120 s** | Multiarticular con carga lumbar |
| Face pull 3×15 | 60 s | **60-90 s** | Accesorio (Singer 2024: >60 s hay un pequeño beneficio) |
| Remo unilateral 3×10 por lado | 60 s | 60 s (está bien) | Alternado por lado: cada lado descansa más |
| Press inclinado 4×8 | 120 s | **150 s** | Multiarticular principal |
| Press militar 3×8 | 90 s | **120 s** | Multiarticular |
| Fondos 3×8-12 | 90 s | **120 s** | Multiarticular con peso corporal o lastre |
| Landmine con rotación 4×5 por lado | 90 s | 90 s (está bien) | Alternado por lado |
| Curl martillo 3×12 | 60 s | **75-90 s** | Accesorio |
| Curl reverso 3×12 | 60 s | **75-90 s** | Accesorio |
| Pinch 3×30 s | 45 s | **60 s** | Isométrico de agarre; recuperar antes de la siguiente serie (débil) |
| Colgarse del gi 3×máx | 60 s | **90 s** | Al fallo isométrico |
| Farmer 4×30 m | 60 s | **90 s** | Global y de agarre |
| Swing 5×10 | 60 s | **90 s** | Si el objetivo es potencia; 60 s solo si es para el "gas" |
| Salto al cajón 4×4 | 90 s | **120-180 s** | Potencia: recuperación completa (ACSM 2009: 3-5 min con cargas ligeras) |
| Lanzamiento rotacional 3×6 por lado | 60 s | **90 s** | Potencia |
| Remo máquina 4×250 m | 90 s | 90 s (está bien) | Es un intervalo de acondicionamiento, no fuerza |
| Abdominales: 5 s entre ejercicios y 90 s entre rondas | — | Está bien | Circuito de resistencia local (<90 s, ACSM 2009) |

Implementación: el tiempo de la sesión (`costo`, `logic.js:70`) usa `d`. Al subir los descansos, en 60 min caben menos ejercicios, y eso refuerza la necesidad del punto 4 (prioridad).

### D. Intensidad, progresión y fases
6. Cambiar las repeticiones fijas por **rangos**: pm_hex "4-6", hack, jalón, remo y press "6-8", hip thrust "8-10", accesorios "10-12" o "12-15".
7. `sugerirKg`: subir solo si **todas las series llegan al tope del rango y el RPE registrado es ≤ el objetivo de la fase**. El incremento debe ser **proporcional** (2,5-5 %, redondeado al salto mínimo del equipo): +2,5 kg en barras y máquinas pesadas, +1-2 kg o la siguiente mancuerna en accesorios. Para kettlebell y mancuernas fijas, progresar primero en repeticiones (Plotkin 2022; ACSM 2009). Ajustar el test `tests/logic.test.mjs:16-18`.
8. Declarar un RPE por fase: base 6-7, construcción 7-8, específica 7-8 (mantener la fuerza), descarga 6-7.
9. **Descarga real**: (a) poner un tope de series totales por sesión (por ejemplo, el 50-60 % de las series de la construcción) en lugar de multiplicar por ejercicio y rellenar con más ejercicios; (b) mantener **Fuerza A y B** en la semana de descarga (misma frecuencia) con la misma carga y RPE 6-7 (Bosquet 2007); (c) quitar `Math.max(2, …)` en la descarga o permitir 1 serie en los accesorios.
10. Fase base de 3-4 semanas con cargas de al menos el 65-70 % 1RM (el tendón responde a la magnitud de la carga, Bohm 2015). No usar cargas demasiado livianas.

### E. Calentamiento, elongación y sustituciones
11. Agregar **series de aproximación automáticas** al primer ejercicio de cada patrón (por ejemplo 50 % × 5, 70 % × 3, 85 % × 1 en pm_hex), calculadas desde `kgSug`, sin contarlas en el volumen (Fradkin 2010; McCrary 2015).
12. En el calentamiento, cambiar "Estiramiento de espalda" por movilidad dinámica (gato-camello, rotaciones torácicas) o limitar el estático a ≤30 s (Simic 2013; Behm 2016).
13. Mantener la elongación final con el texto "para rango de movimiento", no "recuperación" ni "prevención" (Afonso 2021; Warneke 2025).
14. Sustituciones: agregar un campo de **patrón** y ordenar `alternativas` primero por patrón y después por músculos compartidos. Agregar **curl femoral** como sustituto del nórdico y **aducción en máquina o polea** como sustituto de la Copenhague. Prohibir los cruces explosivo ↔ fuerza pesada.

### F. Concurrencia con cardio y BJJ
15. En `distribuir`: separar ≥6 h (ideal 24 h) la fuerza de los intervalos, los rounds y el BJJ intenso (Robineau 2016; Schumann 2022). Si van el mismo día, la fuerza primero. Proteger sobre todo la sesión con explosivos.
16. Opcional: preguntar por las horas de sueño y bajar el RPE objetivo en 1 punto en los básicos si el usuario durmió poco varias noches (Knowles 2018).
