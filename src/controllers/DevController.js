const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const {findConnections, sendMessage} = require ('../WebSocket')


module.exports = {
async index(request, reponse){
    const devs = await Dev.find();
    return reponse.json(devs);
},

    async store(request, response) {
        const {github_username, techs, latitude, longitude} = request.body;
        
        let dev = await Dev.findOne({github_username});
        if(!dev){
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
            const  {name = login, avatar_url, bio} = apiResponse.data;
            const techsArray = parseStringAsArray(techs);
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
          
            //console.log(name, avatar_url, bio, github_username, techs);
           dev = await Dev.create({
              github_username,
              name,
              avatar_url,
              bio,
              techs: techsArray,
              location
          }); 

          const sendSocketMessageTo = findConnections({latitude, longitude}, techsArray)
          sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }


      return response.json(dev);
    }
}