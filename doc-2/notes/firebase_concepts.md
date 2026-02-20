### timeline

after deploying firestore.indexes the browser console asked additional database queries to be added. clicked on the link and did what it asked

| Collection ID	| Fields indexed | Query scope | Index ID | Status	|
|-|-|-|-|-|
| activity_logs	| department|timestamp|__name__|Collection|CICAgOjXh4EK		|Enabled|

---

### string slicing

Firestore rules don't have replace(), but since we now store the group letter (e.g., B), we can check: resource.data.section == getUserSection()[0:1] (using string slice)

