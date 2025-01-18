// controllers/leetcodeController.js
export const getLeetCodeProfile = async (req, res) => {
  try {
      const { username } = req.params;
      const response = await axios.get(`https://leetcode.com/${username}`);
      
      // Extract the JSON data from the script tag
      const scriptTagRegex = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/;
      const match = response.data.match(scriptTagRegex);
      
      if (!match) {
          return res.status(404).json({ error: 'Profile data not found' });
      }

      const jsonData = JSON.parse(match[1]);
      const userData = jsonData.props.pageProps.dehydratedState.queries;
      
      // Find relevant queries
      const profileQuery = userData.find(q => q.queryKey[0] === "userPublicProfile");
      const languageQuery = userData.find(q => q.state.data.matchedUser?.languageProblemCount);
      const badgeQuery = userData.find(q => q.queryKey[0] === "getUserProfile");

      if (!profileQuery?.state?.data?.matchedUser) {
          return res.status(404).json({ error: 'User not found' });
      }

      const matchedUser = profileQuery.state.data.matchedUser;
      const profile = matchedUser.profile;
      const languages = languageQuery?.state?.data?.matchedUser?.languageProblemCount || [];
      const activeBadge = badgeQuery?.state?.data?.matchedUser?.activeBadge;

      // Format the data to match your frontend expectations
      const profileData = {
          username: matchedUser.username,
          ranking: profile.ranking,
          total_problems_solved: languages.reduce((total, lang) => total + lang.problemsSolved, 0),
          contribution_points: profile.reputation || 0,
          acceptance_rate: profile.solutionCount || 0,
          country: profile.countryName,
          languages: languages.map(lang => ({
              name: lang.languageName,
              solved: lang.problemsSolved
          })),
          badges: activeBadge ? [{
              name: activeBadge.displayName,
              icon: activeBadge.icon
          }] : [],
          profile_info: {
              avatar: profile.userAvatar,
              name: profile.realName,
              company: profile.company,
              school: profile.school,
              websites: profile.websites || []
          }
      };

      res.json(profileData);

  } catch (error) {
      console.error('LeetCode Profile Error:', error);
      res.status(500).json({ 
          error: 'Failed to fetch LeetCode profile',
          details: error.message 
      });
  }
};