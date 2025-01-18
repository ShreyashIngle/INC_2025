import requests
import json

class LeetCodeFetcher:
    def __init__(self):
        self.base_url = "https://leetcode.com/graphql"
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def get_profile_data(self, username):
        try:
            # GraphQL query to fetch user profile data
            query = """
            query userPublicProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                    profile {
                        ranking
                        reputation
                        starRating
                    }
                    badges {
                        id
                        displayName
                        icon
                    }
                    problemsSolvedBeatsStats {
                        difficulty
                        percentage
                    }
                }
            }
            """
            
            # Variables for the query
            variables = {
                "username": username
            }
            
            # Make the request
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "query": query,
                    "variables": variables
                }
            )
            
            if response.status_code != 200:
                return {
                    "error": f"Failed to fetch profile data. Status code: {response.status_code}"
                }

            data = response.json()
            
            if "errors" in data:
                return {"error": data["errors"][0]["message"]}
                
            if not data.get("data", {}).get("matchedUser"):
                return {"error": "User not found"}

            user_data = data["data"]["matchedUser"]
            
            # Process and format the response
            profile_data = {
                "username": user_data["username"],
                "solved_problems": self._process_submission_stats(user_data["submitStats"]["acSubmissionNum"]),
                "ranking": user_data["profile"]["ranking"],
                "reputation": user_data["profile"]["reputation"],
                "star_rating": user_data["profile"]["starRating"],
                "badges": [
                    {
                        "name": badge["displayName"],
                        "icon": badge["icon"]
                    } for badge in user_data["badges"]
                ],
                "beats_stats": user_data["problemsSolvedBeatsStats"]
            }

            return profile_data

        except requests.RequestException as e:
            return {"error": f"Network error: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}

    def _process_submission_stats(self, stats):
        result = {
            "total": 0,
            "by_difficulty": {}
        }
        
        for stat in stats:
            if stat["difficulty"] == "All":
                result["total"] = stat["count"]
            else:
                result["by_difficulty"][stat["difficulty"].lower()] = {
                    "count": stat["count"],
                    "submissions": stat["submissions"]
                }
                
        return result