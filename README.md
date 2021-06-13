# Company phone number fetcher

This API returns the phone number of the company given as parameter.

## Usage

```
$ curl -G --data-urlencode "name=EXPERDECO" --data-urlencode "address=74970 MARIGNIER" --data-urlencode "siren=303830244" http://localhost:3000/api/company

+33 4 50 34 63 54
```

## Implementation details

- If a phone number is found and a valid siren is provided, the data is saved in a database for subsequent queries.
- To store additionnal data about the company, we use an enpoint provided by [data.gouv.fr](https://entreprise.data.gouv.fr/api/sirene/v3/unites_legales).
- If the phone number found contains 10 digits, it is format as `+33 # ## ## ## ##`.
