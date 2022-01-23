# Desafío 13 **"DUAL-GOOGLE"** - Programación Backend

### CoderHouse

## INICIO DE SESIÓN DUAL

Esta basado en el **Desafío 13**, con la incorporación del método de autenticación usando una cuenta de **Google**, aparte del tradicional método de usuario y contraseña.

### Consigna desafío 13 (simple)

Implementar sobre el entregable que venimos realizando un mecanismo de autenticación. Para ello:

Se incluirá una vista de registro, en donde se pidan email y contraseña. Estos datos se persistirán usando MongoDb, en una (nueva) colección de usuarios, cuidando que la contraseña quede encriptada (sugerencia: usar la librería bcrypt).

Una vista de login, donde se pida email y contraseña, y que realice la autenticación del lado del servidor a través de una estrategia de passport local.

Cada una de las vistas (logueo - registro) deberá tener un botón para ser redirigido a la otra.

Una vez logueado el usuario, se lo redirigirá al inicio, el cual ahora mostrará también su email, y un botón para desolguearse.

Además, se activará un espacio de sesión controlado por la sesión de passport. Esta estará activa por 10 minutos y en cada acceso se recargará este tiempo.

Agregar también vistas de error para login (credenciales no válidas) y registro (usuario ya registrado).

El resto de la funciones, deben quedar tal cual estaban el proyecto original.

### Deploy en Heroku (Temporal):

https://des13-dual-prellezose.herokuapp.com/

### Ejecución

Luego de clonar o descargar el repositorio e instalar todas las dependencias con `npm install`, existen dos comandos para levantar el proyecto.
Para levantarlo en modo de desarrollo junto a nodemon, utilizar `npm run dev`. De lo contrario, para ejecutarlo en "modo producción", utilizar `npm start`.

Se puede seleccionar entre dos métodos de persistencia de **datos y sesiones** a través de la variable de entorno `PERS`. El modo `PERS=mongodb_atlas` **(DEFECTO)** para persistir en **MongoDB Atlas** y el modo `PERS=mongodb` para hacer lo mismo en **MongoDB local**

### Vistas

Existen las siguientes vistas que proveen una manera amena de probar el desafío.
Estas vistas se encuentran en las rutas:

- **/** : es la vista principal en donde se encuentra el formulario de carga de productos y el centro de mensajes (chat). Utiliza **websockets**. Requiere autenticación.

- **/login** : formulario de login.

- **/login-error** : vista a la que redirige tras un error en el login.

- **/register** : formulario de registro.

- **/register-error** : vista a la que redirige tras un error en el login.

- **/logout** : vista a la que se accede tras hacer el logout y luego de 5 segundos redirige a home.

- **/productos-mock** : es donde se muestra en una tabla el mock de productos devueltos por la llamada a la API en la ruta de test. Requiere autenticación

### API

Consiste en las siguientes rutas:

#### Router /api/productos

| Método | Endpoint                | Descripción                                                        |
| ------ | ----------------------- | ------------------------------------------------------------------ |
| GET    | **/api/productos/**     | Me permite listar todos los productos disponibles                  |
| POST   | **/api/productos/**     | Para incorporar productos al listado                               |
| GET    | **/api/productos/:id**  | Me permite listar un producto por su id                            |
| PUT    | **/api/productos/:id**  | Actualiza un producto por su id. Admite actualizaciones parciales  |
| DELETE | **/api/productos/:id**  | Borra un producto por su id                                        |
| GET    | **/api/productos-test** | Devuelve un listado de 5 productos mock generados con **Faker.js** |

### Detalles y comentarios

Las sesiones del usuario se almacenan en **MongoDB** en la colección `sessions` utilizando el modulo `connect-mongo`.

Se aplicaron estrategias de autenticación tanto al **login** como al **registro**, por lo que luego de completar con éxito cualquiera de ellos, ya se logra autenticar al usuario y redirigir a la vista principal.

En caso de estar logueado, evito poder acceder directamente a la vista de login o registro, redirigiendo a la vista principal para sugerir realizar el **logout** previo a ello.

El formulario de registro incluye el ingreso de la contraseña por segunda vez, para su verificación.

Aparte de las validaciones en el front previo a enviar los datos al servidor del formulario de registro, se produce una segunda validación del lado del servidor mediante un **middleware** `validateRegisterPost` a fin de asegurarse guardar en la BD los datos de manera correcta.

Se pasan mensajes a través de la sesión activando la opción `failureMessage` y `successMessage` del método `authenticate` de passport. Luego en la vista destino se recibe dicha información y se procesa debidamente (reseteando el mensaje), para mostrar mensajes personalizados.  
En un principio, use la funcionalidad incorporada de éste mismo método para setear esos mensajes usando el modulo `connect-flash` mediante las opciones `failureFlash` y `successFlash`. Pero noté que presentaba mayores problemas de carrera al usar **MongoDB Atlas** como “store” para las sesiones. Esto, por los tiempos asíncronos involucrados en las operaciones de escritura y posterior lectura al redirigir a la siguiente vista. Es más sencillo y prolijo su uso, pero decidí usar el pasaje por `req.session` y trabajar manualmente el reseteo de los mensajes luego de usarlos.

Para almacenar el registro de usuarios, utilicé una clase extendida del `ContenedorMongoDB`, incorporando un método de búsqueda por "username" (en lugar de id). Esta da origen a la clase `UsersDaoMongoDB`.

Incorporé un botón de inicio de sesión con cuenta de **Google** y la correspondiente `Strategy` de **passport**.

Para la serialización y des-serialización del usuario en la sesión, utilicé unas funciones que contemplan ambos mecanismos diferentes. En el caso de tratarse del mecanismo de usuario y contraseña, utiliza el id para serializar y des-serializar el usuario. Si se trata del usuario obtenido por la estrategia de **Google**, no produce ninguna serialización ni des-serialización correspondiente (Ejemplo sencillo).

Tras autenticarse e ingresar a la pagina principal, se cargan los datos del usuario según el método de autenticación empleado:

- Si se utilizó la estrategia **local**: Se muestra la Bienvenida seguida del **email** del usuario, y el input de email del centro de mensajes, se completa con el **email** del usuario logueado y se evita su modificación.
- Si se utilizó la estrategia de **Google**: Se muestra la Bienvenida seguida del **nombre completo** del usuario, y se coloca su **avatar** junto al botón de logout.  
  En el centro de mensajes, se completa tanto el **email, nombre, apellido y avatar del usuario** para posteriormente ser usado y representado en los mensajes del mismo.
