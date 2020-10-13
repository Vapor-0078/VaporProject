const nodeHtmlToImage = require('node-html-to-image');
const path        = require('path');
 module.exports={
//     genrateInvoiceImage:async (owner, Businsess, Business_Tag_Line, E_address, Contact, Address, City, State, Pin_Code, Country, Logopath, Imagepath)=>{
// nodeHtmlToImage((html)={    
//      output:path.join(__dirname,  Imagepath+'.png'),
//     html: `<!doctype html>
//     <html>
//       <head>
//         <style>
//           body {
//             width: 600px;
//             height: 250px;
//             background-color: #232532;
//             font-size: 14px;
//             color: lemonchiffon;
//             background-size: 600px 250px; 
//             // background-image: url(http://localhost:8006/vaporcardback.png);
//             font-family:"Comic Sans MS", cursive;
//             padding: 10px;
//           }         
//           .widthHalf{
//             width: 55%;
//           }
//           .avatar {
//             vertical-align: middle;
//             width: 60px;
//             height: 60px;
//             border-radius: 50%;
//           }

//         </style>
//         <meta name='viewport' content='width=device-width, initial-scale=1'>
// <script src='https://kit.fontawesome.com/a076d05399.js'></script>
//       </head>
//       <body><h3 style="font-family:"Comic Sans MS", cursive;font-weight:large "><img src="http://${Logopath}" alt="Avatar" class="avatar"> ${Businsess}</h3>
//       <h3 style="text-align : center">${Business_Tag_Line}</h3>
//       <table>
//         <tr>
//         <td>Owner:</td>
//         <td class="widthHalf">${ owner }</td>
//         <td>Business:</td>
//         <td >${ Businsess }</td>
//         </tr>
//         <tr> 
//           <td>Email Id:</td>
//           <td class="widthHalf">${ E_address }</td>
//           <td>Location:</td>
//           <td>${ City }</td>
//         </tr>
//         <tr>
//         </tr>
//         <td>Contact:</td>
//           <td>${ Contact }</td>
//         <tr>
//           <td>Address:</td>
//           <td class="widthHalf">${ Address }, ${City}, ${Pin_Code}</td>
//         </tr>
//       </table>
//       </body>
//     </html>
//     `
// })
//   .then(() => {console.log('The image was created successfully!',html)
//   return html;
// })
 
// },

cardImage:async(req, res, db, MongoClient)=>{        
  let result= await db.collection('Business_detail').find({userId:new MongoClient.ObjectID(req.body.userId)}).toArray();
  console.log(result);
  var owner = result[0].name
  var Businsess= result[0].Business_Name;
  var Business_Tag_Line= result[0].Business_Tag_Line;
  console.log(Businsess);
  var E_address= result[0].email;
  var Contact = result[0].MobileNo;
  var Address = result[0].Address;
  var City = result[0].City;
  var State = result[0].State;
  var Pin_Code= result[0].Pin_Code;
  var Country = result[0].Pin_Code;
  var Logopath = result[0].Logopath;
  console.log(Logopath);
  Imagepath = "B_Card"+Math.random().toString(36).substr(2, 9);

  var pathbusiness = "http://localhost:8006/"+Imagepath+'.png';
   nodeHtmlToImage({   
    output:path.join(__dirname,  Imagepath+'.png'),
    html: `<!doctype html>
    <html>
      <head>
        <style>
          body {
            width: 600px;
            height: 250px;
            background-color: #232532;
            font-size: 14px;
            color: lemonchiffon;
            background-size: 600px 250px; 
            // background-image: url(http://localhost:8006/vaporcardback.png);
            font-family:"Comic Sans MS", cursive;
            padding: 10px;
          }         
          .widthHalf{
            width: 55%;
          }
          .avatar {
            vertical-align: middle;
            width: 60px;
            height: 60px;
            border-radius: 50%;
          }

        </style>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
<script src='https://kit.fontawesome.com/a076d05399.js'></script>
      </head>
      <body><h3 style="font-family:"Comic Sans MS", cursive;font-weight:large "><img src="http://${Logopath}" alt="Avatar" class="avatar"> ${Businsess}</h3>
      <h3 style="text-align : center">${Business_Tag_Line}</h3>
      <table>
        <tr>
        <td>Owner:</td>
        <td class="widthHalf">${ owner }</td>
        <td>Business:</td>
        <td >${ Businsess }</td>
        </tr>
        <tr> 
          <td>Email Id:</td>
          <td class="widthHalf">${ E_address }</td>
          <td>Location:</td>
          <td>${ City }</td>
        </tr>
        <tr>
        </tr>
        <td>Contact:</td>
          <td>${ Contact }</td>
        <tr>
          <td>Address:</td>
          <td class="widthHalf">${ Address }, ${City}, ${Pin_Code}</td>
        </tr>
      </table>
      </body>
    </html>
    `
})
  .then(() => {console.log('The image was created successfully!')
})
  // console.log(imagetemplet)
  db.collection('Business_detail').updateMany({userId:new MongoClient.ObjectID(req.body.userId)}, {
    $set:{
     "Business_Card":pathbusiness
    }
  },{
    multi:true
  })
  res.send('you card has been genraated');
  },

}