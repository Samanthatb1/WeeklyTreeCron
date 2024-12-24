import nodemailer from 'nodemailer';
import { memoizedData } from './webScrape.js';

// send email for every single user subscribed
async function sendEmails(allUsers){
 // Create a single transporter to be reused
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'weeklytree.notifs@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  try {
    const memoizedGetData = memoizedData()
    for (const user of allUsers){
      try {
        await sendEmail(user.email_id, user.links, memoizedGetData, transporter);
        console.log(`user ${user.email_id} succeeded`);
      } catch(e){
        console.log(`user ${user.email_id} failed`);
      }
    }
    console.log("All emails complete")
  } finally {
    // Close the transport connection when we're done
    transporter.close();
    process.exit(0);
    }
  }

// send one email to one user
async function sendEmail(email, links, memoizedGetData, transporter){
  const allEventData = [];

  // Get event data for every link tree the user is subscribed to
  for (const link of links){
    // Get event data for one link tree
    try { // If one link fails, the rest should still run
      const organization = await memoizedGetData(link)
      allEventData.push(organization)
    } catch(e) {
      console.log(`link: ${link} was not present in the memoized hash: ${e}`)
    }
  }

  // Contents of email
  let emailBody = `
    <!DOCTYPE html>
    <html style="background-color:#fcffff;font-family: Arial, sans-serif;">
      <body style="background-color:#f8f2ff;">
        <h1 style="margin:5px;color:#6007d6;font-size:40px;text-shadow: 1px 1px #023047;font-family: Tahoma, sans-serif">
          <b>LinkTree Updates</b>
        </h1>
  `

  // EXAMPLE
  // allEventData = [{name: wie, events: []}, {name: csc, events:[]}]

  for (const organization of allEventData){
    emailBody += `
      <h4 style="margin:8px;background-color:#c3abff;color:#023047;padding:7px;font-size:20px;"> 
        ${organization.organization_name} 
      </h4>`

    // Loop through all sub events
    let c = 1
    for (const event of organization.events){
      emailBody += `
        <p style="color:#009D8E;padding-bottom:2px;margin:3px 0 3px 0;font-size:19px;padding-left:10px">
          <a style="color:#023047;" href="${event.link}">${c}. ${event.name}</a>
        </p>`
      c+=1
    }
  }

  // End of email
  emailBody += `
        <br>
        <br>
      </body>
    </html>
  `

  const mailOptions = {
    from: 'weeklytree.notifs@gmail.com',
    to: email,
    subject: 'WeeklyTree Updates',
    html: emailBody
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("Email failed to send to ", email);
        reject(error);
      } else {
        console.log('Email sent to ', email);
        resolve();
      }
    });
  });
}

export { sendEmails };